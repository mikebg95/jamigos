/**
 * Auth configuration for both web and mobile
 *
 * Mobile uses a custom URL scheme for OAuth2 redirects.
 * Web continues to use standard HTTP(S) URLs.
 */

/**
 * Mobile redirect URI configuration
 *
 * Format: com.jamigos.app://auth/callback
 * - Scheme: com.jamigos.app (matches app ID)
 * - Host: auth
 * - Path: /callback
 *
 * This URI must be registered in:
 * 1. Keycloak client config (jamigos-mobile-client)
 * 2. Android intent filters
 * 3. iOS URL scheme configuration
 */
export const MOBILE_REDIRECT_URI = 'com.jamigos.app://auth/callback';

/**
 * Mobile redirect URI components (for parsing and validation)
 */
export const MOBILE_REDIRECT_CONFIG = {
    scheme: 'com.jamigos.app',
    host: 'auth',
    path: '/callback',
    fullUri: 'com.jamigos.app://auth/callback',
};

/**
 * Check if a URL matches the mobile redirect URI pattern
 * @param {string} url - URL to check
 * @returns {boolean} True if URL matches mobile redirect pattern
 */
export function isMobileRedirectUrl(url) {
    if (!url) return false;
    return url.startsWith(MOBILE_REDIRECT_CONFIG.fullUri);
}

/**
 * Extract auth code from redirect URL
 * @param {string} url - Redirect URL (e.g., "com.jamigos.app://auth/callback?code=...")
 * @returns {Object} { code: string, state: string } or null if invalid
 */
export function parseAuthCallback(url) {
    if (!isMobileRedirectUrl(url)) {
        return null;
    }

    try {
        // Parse URL using URL API (works with custom schemes)
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        const state = urlObj.searchParams.get('state');
        const error = urlObj.searchParams.get('error');
        const errorDescription = urlObj.searchParams.get('error_description');

        if (error) {
            return { error, errorDescription };
        }

        if (!code) {
            return null;
        }

        return { code, state };
    } catch (err) {
        console.error('Failed to parse auth callback URL:', err);
        return null;
    }
}
