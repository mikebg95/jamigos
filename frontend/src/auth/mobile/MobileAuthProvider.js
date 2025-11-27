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
import { Capacitor } from '@capacitor/core';
import { generateCodeVerifier, generateCodeChallenge } from './pkce.js';
import {
    buildAuthUrl,
    buildRegisterUrl,
    buildTokenExchangeParams,
    buildTokenRefreshParams,
    getTokenEndpoint,
    getLogoutEndpoint,
} from './keycloakMobileEndpoints.js';
import { setAuthCallbackHandler } from '@/utils/deepLinkHandler.js';
import { getTheme } from '@/utils/theme.js';
import { openAuth } from '@/plugins/jamigosInAppAuth';
import { saveTokens, loadTokens, clearTokens as clearNativeTokens } from './nativeTokenStorage.js';

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
        // Try to hydrate from native storage if no in-memory tokens
        if (!tokenStorage.accessToken) {
            try {
                const storedTokens = await loadTokens();

                if (storedTokens && storedTokens.accessToken) {
                    tokenStorage.accessToken = storedTokens.accessToken;
                    tokenStorage.refreshToken = storedTokens.refreshToken;
                    tokenStorage.idToken = storedTokens.idToken;
                    tokenStorage.expiresAt = storedTokens.expiresAt;
                }
            } catch (error) {
                console.error('Failed to load tokens from native storage:', error);
            }
        }

        // Check if we have stored tokens
        if (tokenStorage.accessToken && tokenStorage.expiresAt) {
            const now = Date.now();

            // If token is still valid (with 30s buffer)
            if (tokenStorage.expiresAt - 30000 > now) {
                const user = this._parseIdToken(tokenStorage.idToken, tokenStorage.accessToken);
                currentUser = user;

                return {
                    authenticated: true,
                    roles: user.roles || [],
                    tokenParsed: user.tokenParsed || {},
                };
            }

            // Token expired but we have refresh token
            if (tokenStorage.refreshToken) {
                try {
                    await this.refreshAccessToken();
                    const user = this._parseIdToken(tokenStorage.idToken, tokenStorage.accessToken);
                    currentUser = user;

                    return {
                        authenticated: true,
                        roles: user.roles || [],
                        tokenParsed: user.tokenParsed || {},
                    };
                } catch (err) {
                    console.error('Token refresh failed during init:', err);
                }
            }
        }

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
        try {
            // Generate PKCE values
            const verifier = generateCodeVerifier();
            const challenge = await generateCodeChallenge(verifier);
            const state = this._generateState();

            // Store PKCE values for later verification
            pkceStorage.verifier = verifier;
            pkceStorage.state = state;

            // Build authorization URL with current theme
            const theme = getTheme();
            const authUrl = buildAuthUrl({
                codeChallenge: challenge,
                state: state,
                theme: theme,
            });

            // Open auth URL (in-app on iOS, system browser on other platforms)
            const platform = Capacitor.getPlatform();

            if (platform === 'ios') {
                await openAuth(authUrl);
            } else {
                await Browser.open({ url: authUrl });
            }

            // Wait for auth code from deep link
            const { code, state: returnedState } = await this.waitForAuthCode();

            // Verify state (CSRF protection)
            if (returnedState !== state) {
                throw new Error('State mismatch - possible CSRF attack');
            }

            // Exchange code for tokens
            const tokens = await this.exchangeCodeForTokens(code, verifier);

            // Store tokens and parse user info
            await this._storeTokens(tokens);
            const user = this._parseIdToken(tokens.id_token, tokens.access_token);
            currentUser = user;

            return tokens;
        } catch (error) {
            console.error('Login failed:', error);

            // Clean up PKCE storage on error
            pkceStorage.verifier = null;
            pkceStorage.state = null;

            // Clean up browser listener
            this._cleanupBrowserListener();

            throw error;
        } finally {
            // Always close browser after redirect
            try {
                await Browser.close();
            } catch {
                // Browser may already be closed by redirect
            }
        }
    }

    /**
     * Trigger registration/signup flow
     * Opens Keycloak registration page instead of login page
     * @param {string} [redirectPath] - Optional path to redirect to after registration
     * @returns {Promise<Object>} Tokens object
     */
    async register(redirectPath) {
        try {
            // Generate PKCE values
            const verifier = generateCodeVerifier();
            const challenge = await generateCodeChallenge(verifier);
            const state = this._generateState();

            // Store PKCE values for later verification
            pkceStorage.verifier = verifier;
            pkceStorage.state = state;

            // Build registration URL with current theme
            const theme = getTheme();
            const authUrl = buildRegisterUrl({
                codeChallenge: challenge,
                state: state,
                theme: theme,
            });

            // Open auth URL (in-app on iOS, system browser on other platforms)
            const platform = Capacitor.getPlatform();

            if (platform === 'ios') {
                await openAuth(authUrl);
            } else {
                await Browser.open({ url: authUrl });
            }

            // Wait for auth code from deep link
            const { code, state: returnedState } = await this.waitForAuthCode();

            // Verify state (CSRF protection)
            if (returnedState !== state) {
                throw new Error('State mismatch - possible CSRF attack');
            }

            // Exchange code for tokens
            const tokens = await this.exchangeCodeForTokens(code, verifier);

            // Store tokens and parse user info
            await this._storeTokens(tokens);
            const user = this._parseIdToken(tokens.id_token, tokens.access_token);
            currentUser = user;

            return tokens;
        } catch (error) {
            console.error('Registration failed:', error);

            // Clean up PKCE storage on error
            pkceStorage.verifier = null;
            pkceStorage.state = null;

            // Clean up browser listener
            this._cleanupBrowserListener();

            throw error;
        } finally {
            // Always close browser after redirect
            try {
                await Browser.close();
            } catch {
                // Browser may already be closed by redirect
            }
        }
    }

    /**
     * Trigger logout flow
     * @param {string} [redirectPath] - Optional path to redirect to after logout
     */
    async logout(redirectPath) {
        try {
            const logoutUrl = getLogoutEndpoint();
            const idToken = tokenStorage.idToken;

            // Clear tokens locally FIRST
            await this._clearTokens();
            currentUser = null;

            // Call Keycloak logout endpoint in background (don't open browser)
            if (idToken) {
                try {
                    const logoutUrlWithHint = `${logoutUrl}?id_token_hint=${idToken}`;

                    await fetch(logoutUrlWithHint, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        },
                        redirect: 'manual'
                    });
                } catch (fetchError) {
                    // Non-critical: If logout endpoint fails, we still cleared local tokens
                    console.warn('Keycloak logout endpoint failed (non-critical):', fetchError);
                }
            }
        } catch (error) {
            console.error('Logout failed:', error);
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
     * @throws {Error} If callback contains error, timeout occurs, or browser is cancelled
     */
    waitForAuthCode() {
        return new Promise((resolve, reject) => {
            // Store resolve/reject for later use in callback handler
            this._authCodePromise = { resolve, reject };

            // Set timeout (2 minutes)
            const timeout = setTimeout(() => {
                this._cleanupBrowserListener();
                this._authCodePromise = null;
                reject(new Error('Authentication timeout - no response received'));
            }, 120000);

            // Store timeout ID so we can clear it
            this._authCodePromise.timeout = timeout;

            // Listen for browser cancellation
            const browserFinishedListener = Browser.addListener('browserFinished', () => {
                // Only reject if we're still waiting for auth code
                if (this._authCodePromise) {
                    clearTimeout(this._authCodePromise.timeout);
                    this._authCodePromise = null;

                    // Create specific cancellation error
                    const cancelError = new Error('Authentication cancelled');
                    cancelError.code = 'AUTH_CANCELLED';
                    reject(cancelError);
                }
            });

            // Store listener reference so we can clean it up
            this._browserListener = browserFinishedListener;
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
        try {
            const params = buildTokenExchangeParams({
                code: code,
                codeVerifier: codeVerifier,
            });

            const tokenEndpoint = getTokenEndpoint();

            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Token exchange failed:', error);
            throw error;
        }
    }

    /**
     * Refresh access token using refresh token
     * @returns {Promise<Object>} New token set
     * @throws {Error} If refresh fails
     */
    async refreshAccessToken() {
        if (!tokenStorage.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const params = buildTokenRefreshParams(tokenStorage.refreshToken);
            const tokenEndpoint = getTokenEndpoint();

            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            if (!response.ok) {
                const errorText = await response.text();

                // Clear tokens on refresh failure (user must re-authenticate)
                await this._clearTokens();
                currentUser = null;

                throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
            }

            const tokens = await response.json();

            // Store new tokens
            await this._storeTokens(tokens);

            // Update current user from new ID token and access token
            const user = this._parseIdToken(tokens.id_token, tokens.access_token);
            currentUser = user;

            return tokens;
        } catch (error) {
            console.error('Token refresh failed:', error);
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
        if (!this._authCodePromise) {
            return;
        }

        // Clear timeout
        if (this._authCodePromise.timeout) {
            clearTimeout(this._authCodePromise.timeout);
        }

        // Clean up browser listener
        this._cleanupBrowserListener();

        // Check for errors
        if (result.error) {
            // Treat 'cancelled' error as user cancellation (same as browserFinished)
            if (result.error === 'cancelled') {
                const cancelError = new Error('Authentication cancelled');
                cancelError.code = 'AUTH_CANCELLED';
                this._authCodePromise.reject(cancelError);
            } else {
                // Other errors are hard failures
                this._authCodePromise.reject(
                    new Error(`Authentication failed: ${result.error} - ${result.errorDescription || 'Unknown error'}`)
                );
            }

            this._authCodePromise = null;
            return;
        }

        // Check for code
        if (!result.code) {
            this._authCodePromise.reject(new Error('No authorization code in callback'));
            this._authCodePromise = null;
            return;
        }

        // Resolve promise with code and state
        this._authCodePromise.resolve({
            code: result.code,
            state: result.state,
        });

        this._authCodePromise = null;
    }

    /**
     * Store tokens in memory and persist to native storage
     * @param {Object} tokens - Token response from Keycloak
     * @private
     * @returns {Promise<void>}
     */
    async _storeTokens(tokens) {
        const now = Date.now();
        const expiresInMs = (tokens.expires_in || 300) * 1000; // Default 5 min

        tokenStorage.accessToken = tokens.access_token;
        tokenStorage.refreshToken = tokens.refresh_token;
        tokenStorage.idToken = tokens.id_token;
        tokenStorage.expiresAt = now + expiresInMs;

        // Persist to native storage (no-op on web)
        try {
            await saveTokens({
                accessToken: tokenStorage.accessToken,
                refreshToken: tokenStorage.refreshToken,
                idToken: tokenStorage.idToken,
                expiresAt: tokenStorage.expiresAt
            });
        } catch (error) {
            console.error('Failed to persist tokens to native storage:', error);
            // Non-critical error - don't throw, storage failure should not break login
        }
    }

    /**
     * Clear stored tokens from memory and native storage
     * @private
     * @returns {Promise<void>}
     */
    async _clearTokens() {
        tokenStorage.accessToken = null;
        tokenStorage.refreshToken = null;
        tokenStorage.idToken = null;
        tokenStorage.expiresAt = null;

        // Clear from native storage (no-op on web)
        try {
            await clearNativeTokens();
        } catch (error) {
            console.error('Failed to clear tokens from native storage:', error);
            // Non-critical error - don't throw, logout should complete even if storage clear fails
        }
    }

    /**
     * Parse JWT token (works for both ID token and access token)
     * @param {string} token - JWT token
     * @returns {Object|null} Decoded token or null if invalid
     * @private
     */
    _decodeJwt(token) {
        if (!token) {
            return null;
        }

        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            const payload = parts[1];
            return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        } catch (error) {
            console.error('[MobileAuth] Failed to decode JWT:', error);
            return null;
        }
    }

    /**
     * Extract roles from decoded token
     * Roles can be in realm_access or resource_access sections
     * @param {Object} decoded - Decoded JWT payload
     * @returns {string[]} Array of roles
     * @private
     */
    _extractRoles(decoded) {
        if (!decoded) {
            return [];
        }

        // Extract roles from realm_access
        const realmRoles = decoded.realm_access?.roles || [];

        // Extract roles from resource_access for mobile client
        const resourceRoles = decoded.resource_access?.['jamigos-mobile-client']?.roles || [];

        // Combine and deduplicate
        const roles = [...new Set([...realmRoles, ...resourceRoles])];

        return roles;
    }

    /**
     * Parse user info from ID token and access token
     * @param {string} idToken - JWT ID token
     * @param {string} accessToken - JWT access token (optional, used for roles)
     * @returns {Object} User object with roles and parsed token
     * @private
     */
    _parseIdToken(idToken, accessToken = null) {
        if (!idToken) {
            return {
                authenticated: false,
                roles: [],
                tokenParsed: {},
            };
        }

        try {
            // Decode ID token for user info
            const decodedId = this._decodeJwt(idToken);
            if (!decodedId) {
                throw new Error('Failed to decode ID token');
            }

            // Decode access token for roles (if available)
            const decodedAccess = accessToken ? this._decodeJwt(accessToken) : null;

            // Extract roles from access token (preferred) or fallback to ID token
            // Keycloak typically puts roles in the ACCESS token, not the ID token
            const roles = decodedAccess ? this._extractRoles(decodedAccess) : this._extractRoles(decodedId);

            return {
                authenticated: true,
                roles: roles,
                tokenParsed: decodedId,
            };
        } catch (error) {
            console.error('Failed to parse ID token:', error);
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

    /**
     * Clean up browser event listener
     * Removes the 'browserFinished' listener if it exists
     * @private
     */
    _cleanupBrowserListener() {
        if (this._browserListener) {
            this._browserListener.remove();
            this._browserListener = null;
        }
    }
}

export default MobileAuthProvider;
