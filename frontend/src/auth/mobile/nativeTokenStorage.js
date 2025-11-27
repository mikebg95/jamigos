/**
 * Native Token Storage for Mobile
 *
 * This module provides a mobile-only backing store for authentication tokens.
 *
 * Currently uses @capacitor/preferences for simplicity, but is intentionally
 * decoupled so we can later swap to a more secure plugin (iOS Keychain /
 * Android Keystore) without changing any calling code.
 *
 * On web (non-Capacitor), all operations gracefully no-op or return null.
 *
 * Storage format:
 * - Single key: "jamigos_mobile_tokens"
 * - Value: JSON string containing { accessToken, refreshToken, idToken, expiresAt }
 *
 * @module nativeTokenStorage
 */

import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

/**
 * Storage key for token data
 */
const STORAGE_KEY = 'jamigos_mobile_tokens'

/**
 * Check if running on a native platform (iOS/Android)
 * @returns {boolean}
 */
function isNative() {
  return Capacitor.isNativePlatform()
}

/**
 * Save authentication tokens to native storage
 *
 * @param {Object} tokens - Token data to save
 * @param {string} tokens.accessToken - JWT access token
 * @param {string|null} tokens.refreshToken - Refresh token (if available)
 * @param {string} tokens.idToken - ID token
 * @param {number} tokens.expiresAt - Token expiration timestamp (ms since epoch)
 * @returns {Promise<void>}
 *
 * @example
 * await saveTokens({
 *   accessToken: 'eyJ...',
 *   refreshToken: 'eyJ...',
 *   idToken: 'eyJ...',
 *   expiresAt: Date.now() + 3600000
 * })
 */
export async function saveTokens(tokens) {
  if (!isNative()) {
    // On web, no-op with debug log
    if (import.meta.env.DEV) {
      console.debug('[nativeTokenStorage] saveTokens called on web (no-op)')
    }
    return
  }

  try {
    const serialized = JSON.stringify(tokens)
    await Preferences.set({
      key: STORAGE_KEY,
      value: serialized
    })

    if (import.meta.env.DEV) {
      console.debug('[nativeTokenStorage] Tokens saved successfully')
    }
  } catch (error) {
    console.error('[nativeTokenStorage] Failed to save tokens:', error)
    // Don't throw - gracefully handle storage failures
  }
}

/**
 * Load authentication tokens from native storage
 *
 * @returns {Promise<Object|null>} Token data object, or null if not found/invalid
 *
 * @example
 * const tokens = await loadTokens()
 * if (tokens) {
 *   console.log('Access token:', tokens.accessToken)
 * }
 */
export async function loadTokens() {
  if (!isNative()) {
    // On web, always return null
    if (import.meta.env.DEV) {
      console.debug('[nativeTokenStorage] loadTokens called on web (returning null)')
    }
    return null
  }

  try {
    const result = await Preferences.get({ key: STORAGE_KEY })

    if (!result.value) {
      if (import.meta.env.DEV) {
        console.debug('[nativeTokenStorage] No tokens found in storage')
      }
      return null
    }

    const tokens = JSON.parse(result.value)

    if (import.meta.env.DEV) {
      console.debug('[nativeTokenStorage] Tokens loaded successfully')
    }

    return tokens
  } catch (error) {
    console.error('[nativeTokenStorage] Failed to load tokens:', error)
    return null
  }
}

/**
 * Clear all authentication tokens from native storage
 *
 * @returns {Promise<void>}
 *
 * @example
 * await clearTokens()
 */
export async function clearTokens() {
  if (!isNative()) {
    // On web, no-op with debug log
    if (import.meta.env.DEV) {
      console.debug('[nativeTokenStorage] clearTokens called on web (no-op)')
    }
    return
  }

  try {
    await Preferences.remove({ key: STORAGE_KEY })

    if (import.meta.env.DEV) {
      console.debug('[nativeTokenStorage] Tokens cleared successfully')
    }
  } catch (error) {
    console.error('[nativeTokenStorage] Failed to clear tokens:', error)
    // Don't throw - gracefully handle storage failures
  }
}
