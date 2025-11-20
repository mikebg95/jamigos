/**
 * Mobile Auth Provider - OAuth2 Authorization Code Flow with PKCE
 *
 * Implements the IAuthProvider interface for mobile (Capacitor) authentication.
 * Uses Keycloak's OAuth2/OIDC endpoints with PKCE for secure mobile auth.
 *
 * Flow:
 * 1. login() generates PKCE values and opens system browser
 * 2. User authenticates in Keycloak
 * 3. Keycloak redirects to com.jamigos.app://auth/callback?code=...
 * 4. Deep link handler fires, waitForAuthCode() resolves
 * 5. exchangeCodeForTokens() sends code + verifier to get tokens
 * 6. Tokens stored in memory, user is authenticated
 *
 * @implements {IAuthProvider}
 */

import { Browser } from '@capacitor/browser';
import { generateCodeVerifier, generateCodeChallenge } from './pkce.js';
import {
    buildAuthUrl,
    buildTokenExchangeParams,
    buildTokenRefreshParams,
    getTokenEndpoint,
    getLogoutEndpoint,
} from './keycloakMobileEndpoints.js';
import { setAuthCallbackHandler } from '@/utils/deepLinkHandler.js';

/**
 * Token storage (in-memory for now, will be moved to secure storage in later step)
 */
let tokenStorage = {
    accessToken: null,
    refreshToken: null,
    idToken: null,
    expiresAt: null, // Timestamp when access token expires
};

/**
 * PKCE storage (temporary, cleared after token exchange)
 */
let pkceStorage = {
    verifier: null,
    state: null,
};

/**
 * User info parsed from ID token
 */
let currentUser = null;

/**
 * Mobile authentication provider for Capacitor apps
 */
class MobileAuthProvider {
    constructor() {
        console.log('[MobileAuth] MobileAuthProvider initialized');

        // Register deep link handler on construction
        setAuthCallbackHandler(this._handleDeepLinkCallback.bind(this));
        console.log('[MobileAuth] Deep link callback handler registered');
    }

    // ========================================================================
    // IAuthProvider Interface Implementation
    // ========================================================================

    /**
     * Initialize authentication and check for existing session
     * @returns {Promise<{authenticated: boolean, roles: string[], tokenParsed: Object}>}
     */
    async initAuth() {
        console.log('[MobileAuth] initAuth() called');

        // Check if we have stored tokens
        if (tokenStorage.accessToken && tokenStorage.expiresAt) {
            const now = Date.now();

            // If token is still valid (with 30s buffer)
            if (tokenStorage.expiresAt - 30000 > now) {
                console.log('[MobileAuth] Found valid stored tokens');
                const user = this._parseIdToken(tokenStorage.idToken);
                currentUser = user;

                return {
                    authenticated: true,
                    roles: user.roles || [],
                    tokenParsed: user.tokenParsed || {},
                };
            }

            // Token expired but we have refresh token
            if (tokenStorage.refreshToken) {
                console.log('[MobileAuth] Access token expired, attempting refresh');
                try {
                    await this.refreshAccessToken();
                    const user = this._parseIdToken(tokenStorage.idToken);
                    currentUser = user;

                    return {
                        authenticated: true,
                        roles: user.roles || [],
                        tokenParsed: user.tokenParsed || {},
                    };
                } catch (err) {
                    console.error('[MobileAuth] Token refresh failed:', err);
                    // Fall through to unauthenticated state
                }
            }
        }

        console.log('[MobileAuth] No valid session found');
        return {
            authenticated: false,
            roles: [],
            tokenParsed: {},
        };
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const hasToken = !!tokenStorage.accessToken;
        const notExpired = tokenStorage.expiresAt && tokenStorage.expiresAt > Date.now();
        return hasToken && notExpired;
    }

    /**
     * Get valid access token (auto-refreshes if expiring soon)
     * @returns {Promise<string>} Access token
     * @throws {Error} If not authenticated or refresh fails
     */
    async getAccessToken() {
        if (!tokenStorage.accessToken) {
            throw new Error('Not authenticated - no access token');
        }

        const now = Date.now();
        const bufferMs = 30000; // 30 second buffer

        // If token expires within buffer period, refresh it
        if (tokenStorage.expiresAt && tokenStorage.expiresAt - bufferMs <= now) {
            console.log('[MobileAuth] Access token expiring soon, refreshing...');

            if (!tokenStorage.refreshToken) {
                throw new Error('Cannot refresh token - no refresh token available');
            }

            await this.refreshAccessToken();
        }

        return tokenStorage.accessToken;
    }

    /**
     * Trigger login flow
     * Opens system browser with Keycloak login page
     * @param {string} [redirectPath] - Optional path to redirect to after login (unused in mobile)
     * @returns {Promise<Object>} Tokens object { access_token, refresh_token, id_token, expires_in }
     */
    async login(redirectPath) {
        console.log('[MobileAuth] ====== LOGIN FLOW STARTED ======');
        console.log('[MobileAuth] Redirect path (unused):', redirectPath);

        try {
            // Step 1: Generate PKCE values
            console.log('[MobileAuth] Step 1: Generating PKCE values...');
            const verifier = generateCodeVerifier();
            const challenge = await generateCodeChallenge(verifier);
            const state = this._generateState();

            console.log('[MobileAuth] Verifier generated (first 10 chars):', verifier.substring(0, 10) + '...');
            console.log('[MobileAuth] Challenge generated (first 10 chars):', challenge.substring(0, 10) + '...');
            console.log('[MobileAuth] State:', state);

            // Store PKCE values for later verification
            pkceStorage.verifier = verifier;
            pkceStorage.state = state;

            // Step 2: Build authorization URL
            console.log('[MobileAuth] Step 2: Building authorization URL...');
            const authUrl = buildAuthUrl({
                codeChallenge: challenge,
                state: state,
            });

            console.log('[MobileAuth] Auth URL:', authUrl);

            // Step 3: Open system browser
            console.log('[MobileAuth] Step 3: Opening system browser...');
            await Browser.open({ url: authUrl });
            console.log('[MobileAuth] Browser opened successfully');

            // Step 4: Wait for auth code from deep link
            console.log('[MobileAuth] Step 4: Waiting for authorization code...');
            const { code, state: returnedState } = await this.waitForAuthCode();

            console.log('[MobileAuth] ✅ Authorization code received');
            console.log('[MobileAuth] Code (first 10 chars):', code.substring(0, 10) + '...');

            // Step 5: Verify state (CSRF protection)
            if (returnedState !== state) {
                throw new Error('State mismatch - possible CSRF attack');
            }
            console.log('[MobileAuth] ✅ State verified');

            // Step 6: Exchange code for tokens
            console.log('[MobileAuth] Step 5: Exchanging code for tokens...');
            const tokens = await this.exchangeCodeForTokens(code, verifier);

            console.log('[MobileAuth] ✅ Tokens received');
            console.log('[MobileAuth] Access token expires in:', tokens.expires_in, 'seconds');

            // Step 7: Store tokens and parse user info
            this._storeTokens(tokens);
            const user = this._parseIdToken(tokens.id_token);
            currentUser = user;

            console.log('[MobileAuth] ✅ User authenticated:', user.tokenParsed?.preferred_username);
            console.log('[MobileAuth] ====== LOGIN FLOW COMPLETED ======');

            return tokens;
        } catch (error) {
            console.error('[MobileAuth] ❌ Login failed:', error);

            // Clean up PKCE storage on error
            pkceStorage.verifier = null;
            pkceStorage.state = null;

            throw error;
        } finally {
            // Always close browser after redirect
            try {
                await Browser.close();
                console.log('[MobileAuth] Browser closed');
            } catch {
                // Browser may already be closed by redirect
                console.log('[MobileAuth] Browser close skipped (may already be closed)');
            }
        }
    }

    /**
     * Trigger registration/signup flow
     * In Keycloak, this is handled by adding action=register to auth URL
     * @param {string} [redirectPath] - Optional path to redirect to after registration
     * @returns {Promise<Object>} Tokens object
     */
    async register(redirectPath) {
        console.log('[MobileAuth] register() - redirecting to login (Keycloak handles registration)');
        // For now, just call login - in future we can add action=register parameter
        // TODO: Modify buildAuthUrl to accept optional action parameter
        return this.login(redirectPath);
    }

    /**
     * Trigger logout flow
     * @param {string} [redirectPath] - Optional path to redirect to after logout
     */
    async logout(redirectPath) {
        console.log('[MobileAuth] ====== LOGOUT FLOW STARTED ======');
        console.log('[MobileAuth] Redirect path (unused):', redirectPath);

        try {
            // Build logout URL
            const logoutUrl = getLogoutEndpoint();
            const idToken = tokenStorage.idToken;

            // Add id_token_hint for proper logout
            const logoutUrlWithHint = idToken
                ? `${logoutUrl}?id_token_hint=${idToken}`
                : logoutUrl;

            console.log('[MobileAuth] Opening logout URL...');

            // Clear tokens BEFORE opening browser (in case of errors)
            this._clearTokens();
            currentUser = null;

            // Open logout URL in browser
            await Browser.open({ url: logoutUrlWithHint });

            console.log('[MobileAuth] ✅ Logout completed');
            console.log('[MobileAuth] ====== LOGOUT FLOW COMPLETED ======');

            // Close browser after short delay
            setTimeout(async () => {
                try {
                    await Browser.close();
                } catch {
                    console.log('[MobileAuth] Browser close skipped');
                }
            }, 1000);
        } catch (error) {
            console.error('[MobileAuth] ❌ Logout failed:', error);
            throw error;
        }
    }

    /**
     * Get current user state
     * @returns {Object|null} User object or null if not authenticated
     */
    getCurrentUser() {
        return currentUser;
    }

    // ========================================================================
    // Core Auth Flow Methods (Required by Step 5)
    // ========================================================================

    /**
     * Wait for authorization code from deep link callback
     * Registers a one-time listener that resolves when deep link fires
     * @returns {Promise<{code: string, state: string}>} Authorization code and state
     * @throws {Error} If callback contains error or timeout occurs
     */
    waitForAuthCode() {
        console.log('[MobileAuth] waitForAuthCode() - setting up promise...');

        return new Promise((resolve, reject) => {
            // Store resolve/reject for later use in callback handler
            this._authCodePromise = { resolve, reject };

            // Set timeout (2 minutes)
            const timeout = setTimeout(() => {
                this._authCodePromise = null;
                reject(new Error('Authentication timeout - no response received'));
            }, 120000);

            // Store timeout ID so we can clear it
            this._authCodePromise.timeout = timeout;

            console.log('[MobileAuth] Promise registered, waiting for deep link...');
        });
    }

    /**
     * Exchange authorization code for tokens
     * @param {string} code - Authorization code from redirect
     * @param {string} codeVerifier - PKCE code verifier
     * @returns {Promise<Object>} Token response { access_token, refresh_token, id_token, expires_in, ... }
     * @throws {Error} If token exchange fails
     */
    async exchangeCodeForTokens(code, codeVerifier) {
        console.log('[MobileAuth] exchangeCodeForTokens() called');
        console.log('[MobileAuth] Code (first 10 chars):', code.substring(0, 10) + '...');
        console.log('[MobileAuth] Verifier (first 10 chars):', codeVerifier.substring(0, 10) + '...');

        try {
            // Build request parameters
            const params = buildTokenExchangeParams({
                code: code,
                codeVerifier: codeVerifier,
            });

            const tokenEndpoint = getTokenEndpoint();
            console.log('[MobileAuth] Posting to token endpoint:', tokenEndpoint);

            // Make token request
            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            console.log('[MobileAuth] Token endpoint response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[MobileAuth] Token exchange failed:', errorText);
                throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
            }

            const tokens = await response.json();
            console.log('[MobileAuth] ✅ Tokens received successfully');
            console.log('[MobileAuth] Token type:', tokens.token_type);
            console.log('[MobileAuth] Expires in:', tokens.expires_in);
            console.log('[MobileAuth] Has refresh token:', !!tokens.refresh_token);

            return tokens;
        } catch (error) {
            console.error('[MobileAuth] ❌ exchangeCodeForTokens failed:', error);
            throw error;
        }
    }

    /**
     * Refresh access token using refresh token
     * @returns {Promise<Object>} New token set
     * @throws {Error} If refresh fails
     */
    async refreshAccessToken() {
        console.log('[MobileAuth] refreshAccessToken() called');

        if (!tokenStorage.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            // Build refresh request parameters
            const params = buildTokenRefreshParams(tokenStorage.refreshToken);
            const tokenEndpoint = getTokenEndpoint();

            console.log('[MobileAuth] Posting refresh request to:', tokenEndpoint);

            // Make refresh request
            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            console.log('[MobileAuth] Refresh response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[MobileAuth] Token refresh failed:', errorText);

                // Clear tokens on refresh failure (user must re-authenticate)
                this._clearTokens();
                currentUser = null;

                throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
            }

            const tokens = await response.json();
            console.log('[MobileAuth] ✅ Tokens refreshed successfully');

            // Store new tokens
            this._storeTokens(tokens);

            // Update current user from new ID token
            const user = this._parseIdToken(tokens.id_token);
            currentUser = user;

            return tokens;
        } catch (error) {
            console.error('[MobileAuth] ❌ refreshAccessToken failed:', error);
            throw error;
        }
    }

    // ========================================================================
    // Internal Helper Methods
    // ========================================================================

    /**
     * Deep link callback handler (called by deepLinkHandler.js)
     * Resolves the waitForAuthCode() promise
     * @param {Object} result - Parsed callback result from parseAuthCallback()
     * @private
     */
    _handleDeepLinkCallback(result) {
        console.log('[MobileAuth] _handleDeepLinkCallback() called');
        console.log('[MobileAuth] Callback result:', result);

        if (!this._authCodePromise) {
            console.warn('[MobileAuth] No pending auth promise - callback ignored');
            return;
        }

        // Clear timeout
        if (this._authCodePromise.timeout) {
            clearTimeout(this._authCodePromise.timeout);
        }

        // Check for errors
        if (result.error) {
            console.error('[MobileAuth] Auth callback error:', result.error);
            this._authCodePromise.reject(
                new Error(`Authentication failed: ${result.error} - ${result.errorDescription || 'Unknown error'}`)
            );
            this._authCodePromise = null;
            return;
        }

        // Check for code
        if (!result.code) {
            console.error('[MobileAuth] No code in callback result');
            this._authCodePromise.reject(new Error('No authorization code in callback'));
            this._authCodePromise = null;
            return;
        }

        console.log('[MobileAuth] ✅ Authorization code received, resolving promise');

        // Resolve promise with code and state
        this._authCodePromise.resolve({
            code: result.code,
            state: result.state,
        });

        this._authCodePromise = null;
    }

    /**
     * Store tokens in memory
     * @param {Object} tokens - Token response from Keycloak
     * @private
     */
    _storeTokens(tokens) {
        const now = Date.now();
        const expiresInMs = (tokens.expires_in || 300) * 1000; // Default 5 min

        tokenStorage.accessToken = tokens.access_token;
        tokenStorage.refreshToken = tokens.refresh_token;
        tokenStorage.idToken = tokens.id_token;
        tokenStorage.expiresAt = now + expiresInMs;

        console.log('[MobileAuth] Tokens stored in memory');
        console.log('[MobileAuth] Expires at:', new Date(tokenStorage.expiresAt).toISOString());
    }

    /**
     * Clear stored tokens
     * @private
     */
    _clearTokens() {
        tokenStorage.accessToken = null;
        tokenStorage.refreshToken = null;
        tokenStorage.idToken = null;
        tokenStorage.expiresAt = null;

        console.log('[MobileAuth] Tokens cleared from memory');
    }

    /**
     * Parse user info from ID token
     * @param {string} idToken - JWT ID token
     * @returns {Object} User object with roles and parsed token
     * @private
     */
    _parseIdToken(idToken) {
        if (!idToken) {
            return {
                authenticated: false,
                roles: [],
                tokenParsed: {},
            };
        }

        try {
            // Decode JWT (format: header.payload.signature)
            const parts = idToken.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            // Decode base64url payload
            const payload = parts[1];
            const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

            // Extract roles from realm_access and resource_access
            const realmRoles = decoded.realm_access?.roles || [];
            const resourceRoles = decoded.resource_access?.['jamigos-mobile-client']?.roles || [];
            const roles = [...new Set([...realmRoles, ...resourceRoles])]; // Deduplicate

            console.log('[MobileAuth] Parsed ID token for user:', decoded.preferred_username);
            console.log('[MobileAuth] Roles:', roles);

            return {
                authenticated: true,
                roles: roles,
                tokenParsed: decoded,
            };
        } catch (error) {
            console.error('[MobileAuth] Failed to parse ID token:', error);
            return {
                authenticated: false,
                roles: [],
                tokenParsed: {},
            };
        }
    }

    /**
     * Generate random state for CSRF protection
     * @returns {string} Random state string
     * @private
     */
    _generateState() {
        // Use crypto.randomUUID if available (modern browsers)
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        // Fallback: generate random string
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
}

export default MobileAuthProvider;
