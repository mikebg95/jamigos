/**
 * Deep link handler for Capacitor mobile apps
 * Listens for app URL opens and handles OAuth redirect callbacks
 */

import { App as CapacitorApp } from '@capacitor/app';
import { isMobileRedirectUrl, parseAuthCallback } from '@/auth/config.js';

/**
 * Callback function type for auth redirects
 * @callback AuthCallbackHandler
 * @param {Object} result - Parse result from auth callback
 * @param {string} [result.code] - Authorization code
 * @param {string} [result.state] - State parameter
 * @param {string} [result.error] - Error code if auth failed
 * @param {string} [result.errorDescription] - Error description
 */

let authCallbackHandler = null;
let isListenerRegistered = false;

/**
 * Initialize deep link handling for the mobile app
 * Should be called early in app initialization (main.js)
 */
export async function initializeDeepLinkHandler() {
    // Log immediately to verify function is called
    console.log('[DeepLink] ====== INITIALIZING DEEP LINK HANDLER ======');
    console.log('[DeepLink] window.Capacitor exists?', typeof window !== 'undefined' && !!window.Capacitor);

    // Only initialize in Capacitor environment
    if (typeof window === 'undefined' || !window.Capacitor) {
        console.log('[DeepLink] Not in Capacitor environment, skipping');
        return;
    }

    if (isListenerRegistered) {
        console.log('[DeepLink] Handler already registered');
        return;
    }

    console.log('[DeepLink] About to register appUrlOpen listener...');

    try {
        await CapacitorApp.addListener('appUrlOpen', (event) => {
            // Log IMMEDIATELY when event fires - before any processing
            console.log('[DeepLink] ====== appUrlOpen EVENT FIRED ======');
            console.log('[DeepLink] Full event object:', JSON.stringify(event, null, 2));
            console.log('[DeepLink] Event URL:', event.url);

            const url = event.url;

            if (!url) {
                console.error('[DeepLink] No URL in event!');
                return;
            }

            console.log('[DeepLink] Processing URL:', url);

            // Check if this is an auth callback
            if (isMobileRedirectUrl(url)) {
                console.log('[DeepLink] ✅ Auth callback detected');
                handleAuthCallback(url);
            } else {
                console.log('[DeepLink] ❌ Non-auth URL, ignoring');
            }
        });

        isListenerRegistered = true;
        console.log('[DeepLink] ✅ Handler registered successfully');
    } catch (error) {
        console.error('[DeepLink] ❌ Failed to register listener:', error);
    }
}

/**
 * Set the handler function for auth callbacks
 * This should be called by the mobile auth provider
 * @param {AuthCallbackHandler} handler - Function to call when auth callback is received
 */
export function setAuthCallbackHandler(handler) {
    authCallbackHandler = handler;
    console.log('[DeepLink] Auth callback handler set');
}

/**
 * Handle incoming auth callback URL
 * @param {string} url - The full redirect URL
 */
function handleAuthCallback(url) {
    console.log('[DeepLink] Parsing auth callback:', url);

    const result = parseAuthCallback(url);

    if (!result) {
        console.error('[DeepLink] Failed to parse auth callback URL');
        return;
    }

    if (result.error) {
        console.error('[DeepLink] Auth error:', result.error, result.errorDescription);
    } else {
        console.log('[DeepLink] Auth code received:', result.code?.substring(0, 10) + '...');
    }

    // Call registered handler if available
    if (authCallbackHandler) {
        console.log('[DeepLink] Calling registered auth handler');
        authCallbackHandler(result);
    } else {
        console.warn('[DeepLink] No auth handler registered, callback ignored');
    }
}

/**
 * Check for any pending app URL (in case app was launched via deep link)
 * Should be called after handler is set up
 */
export async function checkInitialUrl() {
    if (typeof window === 'undefined' || !window.Capacitor) {
        return null;
    }

    try {
        const result = await CapacitorApp.getLaunchUrl();
        if (result && result.url) {
            console.log('[DeepLink] Initial launch URL detected:', result.url);
            return result.url;
        }
    } catch (err) {
        console.error('[DeepLink] Failed to get launch URL:', err);
    }

    return null;
}
