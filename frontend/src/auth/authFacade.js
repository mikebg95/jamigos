/**
 * Auth facade: abstracts authentication for both web (Keycloak) and mobile (native PKCE).
 * The rest of the app uses this interface instead of directly touching Keycloak or platform-specific auth.
 *
 * This allows us to:
 * - Swap auth implementations based on platform (web vs mobile)
 * - Keep auth logic isolated and testable
 * - Make future auth changes easier
 */

/**
 * @typedef {Object} AuthUser
 * @property {boolean} authenticated - Whether the user is authenticated
 * @property {string[]} roles - User's roles (e.g., ['USER', 'ADMIN'])
 * @property {Object} tokenParsed - Decoded JWT claims
 * @property {string} [tokenParsed.preferred_username] - Username
 * @property {string} [tokenParsed.given_name] - First name
 * @property {string} [tokenParsed.family_name] - Last name
 * @property {string} [tokenParsed.email] - Email address
 */

/**
 * @typedef {Object} IAuthProvider
 * @property {function(): Promise<AuthUser>} initAuth - Initialize auth and return user state
 * @property {function(): boolean} isAuthenticated - Check if user is currently authenticated
 * @property {function(): Promise<string>} getAccessToken - Get valid access token (auto-refreshes if needed)
 * @property {function(string=): void} login - Trigger login flow with optional redirect path
 * @property {function(string=): void} register - Trigger registration/signup flow with optional redirect path
 * @property {function(string=): void} logout - Trigger logout flow with optional redirect path
 * @property {function(): AuthUser|null} getCurrentUser - Get current user state (for stores/components)
 */

import WebAuthProvider from './webAuthProvider.js';

// Detect platform: web vs mobile (Capacitor)
const isCapacitor = typeof window !== 'undefined' && window.Capacitor !== undefined;

/**
 * Auth facade instance - automatically uses correct provider based on platform
 * @type {IAuthProvider}
 */
let authProvider;

if (isCapacitor) {
    // Mobile: Will use native PKCE flow (to be implemented in later step)
    throw new Error('Mobile auth provider not yet implemented. Use web build for now.');
} else {
    // Web: Use existing Keycloak implementation
    authProvider = new WebAuthProvider();
}

export default authProvider;
