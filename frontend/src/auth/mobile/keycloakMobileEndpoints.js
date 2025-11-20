/**
 * Keycloak OpenID Connect endpoint builders for mobile PKCE authentication
 *
 * This module provides pure functions to construct Keycloak OAuth2/OIDC URLs
 * for the Authorization Code Flow with PKCE (for native mobile apps).
 *
 * No HTTP requests are made from this module - it only builds URLs.
 */

import { MOBILE_REDIRECT_URI } from '../config.js';

/**
 * Keycloak configuration for mobile authentication
 */
export const KEYCLOAK_MOBILE_CONFIG = {
    /** Base URL of Keycloak server */
    keycloakBaseUrl: 'https://keycloak.jamigos.app',

    /** Keycloak realm name */
    realm: 'jamigos-realm',

    /** Mobile OAuth2 client ID (must be configured as public client in Keycloak) */
    clientId: 'jamigos-mobile-client',

    /** Mobile redirect URI (custom URL scheme for deep linking) */
    redirectUri: MOBILE_REDIRECT_URI,

    /** OAuth2 scope - space-separated list of scopes to request */
    scope: 'openid profile email',

    /** PKCE code challenge method (S256 = SHA-256) */
    codeChallengeMethod: 'S256',
};

/**
 * Get the Keycloak authorization endpoint URL
 *
 * This is the URL where users are redirected to authenticate.
 *
 * @returns {string} Full authorization endpoint URL
 *
 * @example
 * const authEndpoint = getAuthEndpoint();
 * // => "https://keycloak.jamigos.app/realms/jamigos-realm/protocol/openid-connect/auth"
 */
export function getAuthEndpoint() {
    const { keycloakBaseUrl, realm } = KEYCLOAK_MOBILE_CONFIG;
    return `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/auth`;
}

/**
 * Get the Keycloak token endpoint URL
 *
 * This is the URL where authorization codes are exchanged for tokens.
 *
 * @returns {string} Full token endpoint URL
 *
 * @example
 * const tokenEndpoint = getTokenEndpoint();
 * // => "https://keycloak.jamigos.app/realms/jamigos-realm/protocol/openid-connect/token"
 */
export function getTokenEndpoint() {
    const { keycloakBaseUrl, realm } = KEYCLOAK_MOBILE_CONFIG;
    return `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/token`;
}

/**
 * Get the Keycloak registration endpoint URL
 *
 * This is the URL where users are redirected to register/signup.
 *
 * @returns {string} Full registration endpoint URL
 *
 * @example
 * const registerEndpoint = getRegisterEndpoint();
 * // => "https://keycloak.jamigos.app/realms/jamigos-realm/protocol/openid-connect/registrations"
 */
export function getRegisterEndpoint() {
    const { keycloakBaseUrl, realm } = KEYCLOAK_MOBILE_CONFIG;
    return `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/registrations`;
}

/**
 * Get the Keycloak end session (logout) endpoint URL
 *
 * @returns {string} Full logout endpoint URL
 *
 * @example
 * const logoutEndpoint = getLogoutEndpoint();
 * // => "https://keycloak.jamigos.app/realms/jamigos-realm/protocol/openid-connect/logout"
 */
export function getLogoutEndpoint() {
    const { keycloakBaseUrl, realm } = KEYCLOAK_MOBILE_CONFIG;
    return `${keycloakBaseUrl}/realms/${realm}/protocol/openid-connect/logout`;
}

/**
 * Build the complete authorization URL with PKCE parameters
 *
 * @param {Object} params - Authorization parameters
 * @param {string} params.codeChallenge - PKCE code challenge (Base64URL-encoded SHA-256 hash)
 * @param {string} [params.state] - Optional state parameter for CSRF protection
 * @param {string} [params.kcAction] - Optional Keycloak action ('REGISTER' to show registration page)
 * @returns {string} Complete authorization URL ready to open in browser
 *
 * @example
 * import { generateCodeVerifier, generateCodeChallenge } from './pkce.js';
 * import { buildAuthUrl } from './keycloakMobileEndpoints.js';
 *
 * const verifier = generateCodeVerifier();
 * const challenge = await generateCodeChallenge(verifier);
 * const state = Math.random().toString(36).substring(2); // Simple random state
 *
 * // Login
 * const authUrl = buildAuthUrl({
 *   codeChallenge: challenge,
 *   state: state
 * });
 *
 * // Registration
 * const registerUrl = buildAuthUrl({
 *   codeChallenge: challenge,
 *   state: state,
 *   kcAction: 'REGISTER'
 * });
 *
 * console.log(authUrl);
 * // => "https://keycloak.jamigos.app/realms/jamigos-realm/protocol/openid-connect/auth?
 * //     client_id=jamigos-mobile-client&
 * //     redirect_uri=com.jamigos.app://auth/callback&
 * //     response_type=code&
 * //     scope=openid+profile+email&
 * //     code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&
 * //     code_challenge_method=S256&
 * //     state=abc123"
 */
export function buildAuthUrl({ codeChallenge, state }) {
    const { clientId, redirectUri, scope, codeChallengeMethod } = KEYCLOAK_MOBILE_CONFIG;
    const authEndpoint = getAuthEndpoint();

    // Build query parameters
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code', // Authorization Code Flow
        scope: scope,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
    });

    // Add optional state parameter
    if (state) {
        params.append('state', state);
    }

    return `${authEndpoint}?${params.toString()}`;
}

/**
 * Build the registration URL with PKCE parameters
 * Uses the dedicated /registrations endpoint (not /auth with kc_action)
 *
 * @param {Object} params - Registration parameters
 * @param {string} params.codeChallenge - PKCE code challenge (Base64URL-encoded SHA-256 hash)
 * @param {string} [params.state] - Optional state parameter for CSRF protection
 * @returns {string} Complete registration URL ready to open in browser
 *
 * @example
 * const registerUrl = buildRegisterUrl({
 *   codeChallenge: challenge,
 *   state: state
 * });
 * // => "https://keycloak.jamigos.app/realms/jamigos-realm/protocol/openid-connect/registrations?..."
 */
export function buildRegisterUrl({ codeChallenge, state }) {
    const { clientId, redirectUri, scope, codeChallengeMethod } = KEYCLOAK_MOBILE_CONFIG;
    const registerEndpoint = getRegisterEndpoint();

    // Build query parameters (same as auth, but different endpoint)
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code', // Authorization Code Flow
        scope: scope,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
    });

    // Add optional state parameter
    if (state) {
        params.append('state', state);
    }

    return `${registerEndpoint}?${params.toString()}`;
}

/**
 * Build parameters for token exchange request
 *
 * After receiving the authorization code from the redirect, exchange it for tokens.
 *
 * @param {Object} params - Token exchange parameters
 * @param {string} params.code - Authorization code from redirect
 * @param {string} params.codeVerifier - Original PKCE code verifier
 * @returns {URLSearchParams} Form-encoded parameters ready for POST to token endpoint
 *
 * @example
 * import { buildTokenExchangeParams, getTokenEndpoint } from './keycloakMobileEndpoints.js';
 *
 * // After receiving auth code from deep link callback
 * const params = buildTokenExchangeParams({
 *   code: 'auth_code_from_redirect',
 *   codeVerifier: sessionStorage.getItem('pkce_verifier')
 * });
 *
 * // POST to token endpoint (implementation in later step)
 * const response = await fetch(getTokenEndpoint(), {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
 *   body: params.toString()
 * });
 *
 * const tokens = await response.json();
 * // => { access_token: "...", refresh_token: "...", id_token: "..." }
 */
export function buildTokenExchangeParams({ code, codeVerifier }) {
    const { clientId, redirectUri } = KEYCLOAK_MOBILE_CONFIG;

    return new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code: code,
        code_verifier: codeVerifier,
    });
}

/**
 * Build parameters for token refresh request
 *
 * @param {string} refreshToken - The refresh token
 * @returns {URLSearchParams} Form-encoded parameters ready for POST to token endpoint
 *
 * @example
 * import { buildTokenRefreshParams, getTokenEndpoint } from './keycloakMobileEndpoints.js';
 *
 * const params = buildTokenRefreshParams('refresh_token_value');
 *
 * const response = await fetch(getTokenEndpoint(), {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
 *   body: params.toString()
 * });
 *
 * const tokens = await response.json();
 * // => { access_token: "...", refresh_token: "...", id_token: "..." }
 */
export function buildTokenRefreshParams(refreshToken) {
    const { clientId } = KEYCLOAK_MOBILE_CONFIG;

    return new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        refresh_token: refreshToken,
    });
}

/**
 * Complete mobile auth flow example:
 *
 * @example
 * // ============================================================================
 * // STEP 1: Generate PKCE values and build auth URL
 * // ============================================================================
 * import { generateCodeVerifier, generateCodeChallenge } from './pkce.js';
 * import { buildAuthUrl } from './keycloakMobileEndpoints.js';
 * import { Browser } from '@capacitor/browser';
 *
 * async function startMobileLogin() {
 *   // Generate PKCE verifier and challenge
 *   const verifier = generateCodeVerifier();
 *   const challenge = await generateCodeChallenge(verifier);
 *   const state = crypto.randomUUID(); // Random state for CSRF protection
 *
 *   // Store verifier and state (will need them after redirect)
 *   sessionStorage.setItem('pkce_verifier', verifier);
 *   sessionStorage.setItem('oauth_state', state);
 *
 *   // Build auth URL
 *   const authUrl = buildAuthUrl({
 *     codeChallenge: challenge,
 *     state: state
 *   });
 *
 *   // Open system browser for authentication
 *   await Browser.open({ url: authUrl });
 * }
 *
 * // ============================================================================
 * // STEP 2: Handle redirect callback (in deep link handler)
 * // ============================================================================
 * import { parseAuthCallback } from '../config.js';
 * import { buildTokenExchangeParams, getTokenEndpoint } from './keycloakMobileEndpoints.js';
 *
 * async function handleAuthCallback(redirectUrl) {
 *   // Parse authorization code from redirect
 *   const result = parseAuthCallback(redirectUrl);
 *
 *   if (result.error) {
 *     console.error('Auth error:', result.error);
 *     return;
 *   }
 *
 *   // Verify state matches (CSRF protection)
 *   const storedState = sessionStorage.getItem('oauth_state');
 *   if (result.state !== storedState) {
 *     console.error('State mismatch - possible CSRF attack');
 *     return;
 *   }
 *
 *   // Get stored PKCE verifier
 *   const verifier = sessionStorage.getItem('pkce_verifier');
 *
 *   // Exchange auth code for tokens
 *   const params = buildTokenExchangeParams({
 *     code: result.code,
 *     codeVerifier: verifier
 *   });
 *
 *   const response = await fetch(getTokenEndpoint(), {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
 *     body: params.toString()
 *   });
 *
 *   const tokens = await response.json();
 *   // tokens = { access_token, refresh_token, id_token, expires_in, ... }
 *
 *   // Store tokens securely and update app state
 *   // (Implementation in next step)
 * }
 *
 * // ============================================================================
 * // STEP 3: Refresh tokens when access token expires
 * // ============================================================================
 * import { buildTokenRefreshParams, getTokenEndpoint } from './keycloakMobileEndpoints.js';
 *
 * async function refreshAccessToken(refreshToken) {
 *   const params = buildTokenRefreshParams(refreshToken);
 *
 *   const response = await fetch(getTokenEndpoint(), {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
 *     body: params.toString()
 *   });
 *
 *   if (!response.ok) {
 *     // Refresh token expired or invalid - user must re-authenticate
 *     throw new Error('Token refresh failed');
 *   }
 *
 *   const tokens = await response.json();
 *   return tokens;
 * }
 */
