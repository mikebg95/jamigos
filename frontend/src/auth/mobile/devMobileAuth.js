/**
 * DEV-ONLY Mobile Auth Testing Helper
 *
 * This module provides a singleton MobileAuthProvider instance for testing
 * in development mode on native (Capacitor) builds.
 *
 * IMPORTANT: This is ONLY active when:
 * - Running in Capacitor (iOS/Android)
 * - AND in development mode (import.meta.env.DEV)
 *
 * In production or web builds, this does nothing.
 */

import MobileAuthProvider from './MobileAuthProvider.js';

// Detect platform and environment
const isCapacitor = typeof window !== 'undefined' && window.Capacitor !== undefined;
const isDev = import.meta.env.DEV;

// Only create instance in dev + native
// This ensures the dev helper is ONLY active in true development mode
const shouldInitialize = isCapacitor && isDev;

// Only log in dev mode
if (isDev) {
    console.log('[MobileAuth DEV] Detection check:');
    console.log('[MobileAuth DEV]   - window exists?', typeof window !== 'undefined');
    console.log('[MobileAuth DEV]   - window.Capacitor exists?', typeof window !== 'undefined' ? !!window.Capacitor : 'N/A');
    console.log('[MobileAuth DEV]   - isCapacitor =', isCapacitor);
    console.log('[MobileAuth DEV]   - import.meta.env.DEV =', isDev);
    console.log('[MobileAuth DEV]   - import.meta.env.MODE =', import.meta.env.MODE);
    console.log('[MobileAuth DEV]   - shouldInitialize =', shouldInitialize);
}

let mobileAuthInstance = null;

/**
 * Get or create the singleton MobileAuthProvider instance
 * Only works in dev + Capacitor environment
 * @returns {MobileAuthProvider|null}
 */
export function getDevMobileAuth() {
    if (!shouldInitialize) {
        return null;
    }

    if (!mobileAuthInstance) {
        console.log('[MobileAuth DEV] Creating dev MobileAuthProvider instance');
        mobileAuthInstance = new MobileAuthProvider();

        // Expose on window for console debugging
        if (typeof window !== 'undefined') {
            window.mobileAuth = mobileAuthInstance;
            console.log('[MobileAuth DEV] MobileAuthProvider exposed as window.mobileAuth');
        }
    }

    return mobileAuthInstance;
}

/**
 * Check if dev mobile auth is available
 * @returns {boolean}
 */
export function isDevMobileAuthAvailable() {
    return shouldInitialize;
}

/**
 * Test login flow (dev-only)
 * Calls MobileAuthProvider.login() and logs results
 * @returns {Promise<void>}
 */
export async function testMobileLogin() {
    if (!shouldInitialize) {
        console.warn('[MobileAuth TEST] Not available in this environment');
        return;
    }

    console.log('[MobileAuth TEST] Test mobile login button clicked');

    const auth = getDevMobileAuth();

    try {
        console.log('[MobileAuth TEST] Starting login flow...');
        const tokens = await auth.login();

        console.log('[MobileAuth TEST] ✅ Login successful!');
        console.log('[MobileAuth TEST] Login tokens:', tokens);

        const user = auth.getCurrentUser();
        console.log('[MobileAuth TEST] Current user:', user);
        console.log('[MobileAuth TEST] Username:', user?.tokenParsed?.preferred_username);
        console.log('[MobileAuth TEST] Roles:', user?.roles);
        console.log('[MobileAuth TEST] Is authenticated:', auth.isAuthenticated());

        // Alert for visual confirmation (in case console is hard to read)
        if (typeof alert !== 'undefined') {
            alert(`✅ Login successful!\nUsername: ${user?.tokenParsed?.preferred_username}\nRoles: ${user?.roles?.join(', ')}`);
        }
    } catch (error) {
        console.error('[MobileAuth TEST] ❌ Login error:', error);
        console.error('[MobileAuth TEST] Error message:', error.message);
        console.error('[MobileAuth TEST] Error stack:', error.stack);

        // Alert for visual confirmation
        if (typeof alert !== 'undefined') {
            alert(`❌ Login failed!\nError: ${error.message}`);
        }
    }
}

/**
 * Test logout flow (dev-only)
 * @returns {Promise<void>}
 */
export async function testMobileLogout() {
    if (!shouldInitialize) {
        console.warn('[MobileAuth TEST] Not available in this environment');
        return;
    }

    console.log('[MobileAuth TEST] Test mobile logout button clicked');

    const auth = getDevMobileAuth();

    try {
        console.log('[MobileAuth TEST] Starting logout flow...');
        await auth.logout();

        console.log('[MobileAuth TEST] ✅ Logout successful!');
        console.log('[MobileAuth TEST] Is authenticated:', auth.isAuthenticated());

        if (typeof alert !== 'undefined') {
            alert('✅ Logout successful!');
        }
    } catch (error) {
        console.error('[MobileAuth TEST] ❌ Logout error:', error);

        if (typeof alert !== 'undefined') {
            alert(`❌ Logout failed!\nError: ${error.message}`);
        }
    }
}

/**
 * Test get access token (dev-only)
 * @returns {Promise<void>}
 */
export async function testGetAccessToken() {
    if (!shouldInitialize) {
        console.warn('[MobileAuth TEST] Not available in this environment');
        return;
    }

    console.log('[MobileAuth TEST] Test get access token clicked');

    const auth = getDevMobileAuth();

    try {
        const token = await auth.getAccessToken();
        console.log('[MobileAuth TEST] ✅ Access token retrieved');
        console.log('[MobileAuth TEST] Token (first 50 chars):', token.substring(0, 50) + '...');

        if (typeof alert !== 'undefined') {
            alert(`✅ Token retrieved!\nFirst 50 chars: ${token.substring(0, 50)}...`);
        }
    } catch (error) {
        console.error('[MobileAuth TEST] ❌ Get token error:', error);

        if (typeof alert !== 'undefined') {
            alert(`❌ Get token failed!\nError: ${error.message}`);
        }
    }
}

// Initialize on module load (only in dev + Capacitor)
if (shouldInitialize) {
    console.log('[MobileAuth DEV] Dev mode + Capacitor detected');
    console.log('[MobileAuth DEV] Mobile auth testing enabled');
    getDevMobileAuth(); // Create instance and expose on window
}
