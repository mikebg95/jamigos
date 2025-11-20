/**
 * Web auth provider: wraps Keycloak JS adapter for web builds
 * Implements the auth facade interface using existing Keycloak behavior
 */

import keycloak from './keycloak.js';
import { TIMING } from '@/config/constants.js';

class WebAuthProvider {
    /**
     * Initialize Keycloak and return user state
     * @returns {Promise<{authenticated: boolean, roles: string[], tokenParsed: Object}>}
     */
    async initAuth() {
        try {
            await keycloak.init({
                onLoad: 'check-sso',
                pkceMethod: 'S256',
                checkLoginIframe: false,
            });

            return {
                authenticated: keycloak.authenticated || false,
                roles: keycloak.tokenParsed?.realm_access?.roles || [],
                tokenParsed: keycloak.tokenParsed || {},
            };
        } catch (error) {
            console.error('Keycloak initialization failed:', error);
            throw error;
        }
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return keycloak.authenticated || false;
    }

    /**
     * Get valid access token (auto-refreshes if expiring soon)
     * @returns {Promise<string>} Access token
     * @throws {Error} If not authenticated or refresh fails
     */
    async getAccessToken() {
        // Attempt to refresh token if it expires within the buffer period
        try {
            await keycloak.updateToken(TIMING.TOKEN_REFRESH_BUFFER_SEC);
        } catch (err) {
            // Log refresh failures in development
            if (import.meta.env.DEV) {
                console.warn('Token refresh failed:', err);
            }
            throw new Error('Token refresh failed');
        }

        if (!keycloak.authenticated) {
            throw new Error('Not authenticated');
        }

        return keycloak.token;
    }

    /**
     * Trigger login flow
     * @param {string} [redirectPath] - Optional path to redirect to after login
     */
    login(redirectPath) {
        const redirectUri = redirectPath
            ? `${window.location.origin}${redirectPath}`
            : window.location.href;

        keycloak.login({ redirectUri });
    }

    /**
     * Trigger registration/signup flow
     * @param {string} [redirectPath] - Optional path to redirect to after registration
     */
    register(redirectPath) {
        const redirectUri = redirectPath
            ? `${window.location.origin}${redirectPath}`
            : window.location.href;

        keycloak.register({ redirectUri });
    }

    /**
     * Trigger logout flow
     * @param {string} [redirectPath] - Optional path to redirect to after logout
     */
    logout(redirectPath) {
        const redirectUri = redirectPath
            ? `${window.location.origin}${redirectPath}`
            : window.location.origin;

        keycloak.logout({ redirectUri });
    }

    /**
     * Get current user state (for stores/components)
     * @returns {{authenticated: boolean, roles: string[], tokenParsed: Object}|null}
     */
    getCurrentUser() {
        if (!keycloak.authenticated) {
            return null;
        }

        return {
            authenticated: keycloak.authenticated,
            roles: keycloak.tokenParsed?.realm_access?.roles || [],
            tokenParsed: keycloak.tokenParsed || {},
        };
    }
}

export default WebAuthProvider;
