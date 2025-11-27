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
  const native = isNative()
  console.log('[nativeTokenStorage] saveTokens() called, isNative:', native)

  if (!native) {
    console.log('[nativeTokenStorage] On web platform - skipping save (no-op)')
    return
  }

  console.log('[nativeTokenStorage] Saving tokens with key:', STORAGE_KEY)
  console.log('[nativeTokenStorage] Token data:', {
    hasAccessToken: !!tokens.accessToken,
    accessTokenPreview: tokens.accessToken ? tokens.accessToken.substring(0, 20) + '...' : 'null',
    hasRefreshToken: !!tokens.refreshToken,
    hasIdToken: !!tokens.idToken,
    expiresAt: tokens.expiresAt,
    expiresAtDate: tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : 'null'
  })

  try {
    const serialized = JSON.stringify(tokens)
    console.log('[nativeTokenStorage] Serialized length:', serialized.length, 'chars')

    console.log('[nativeTokenStorage] Calling Preferences.set...')
    await Preferences.set({
      key: STORAGE_KEY,
      value: serialized
    })

    console.log('[nativeTokenStorage] ✅ Preferences.set completed successfully')
    console.log('[nativeTokenStorage] ✅ Tokens saved to native storage')
  } catch (error) {
    console.error('[nativeTokenStorage] ❌ Failed to save tokens:', error)
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
  const native = isNative()
  console.log('[nativeTokenStorage] loadTokens() called, isNative:', native)

  if (!native) {
    console.log('[nativeTokenStorage] On web platform - returning null (no-op)')
    return null
  }

  console.log('[nativeTokenStorage] Loading tokens with key:', STORAGE_KEY)

  try {
    console.log('[nativeTokenStorage] Calling Preferences.get...')
    const result = await Preferences.get({ key: STORAGE_KEY })

    console.log('[nativeTokenStorage] Preferences.get result:', {
      hasValue: !!result.value,
      valueLength: result.value ? result.value.length : 0,
      valuePreview: result.value ? result.value.substring(0, 50) + '...' : 'null'
    })

    if (!result.value) {
      console.log('[nativeTokenStorage] ℹ️ No tokens found in storage (value is null/empty)')
      return null
    }

    console.log('[nativeTokenStorage] Parsing JSON...')
    const tokens = JSON.parse(result.value)

    console.log('[nativeTokenStorage] ✅ Tokens parsed successfully:', {
      hasAccessToken: !!tokens.accessToken,
      accessTokenPreview: tokens.accessToken ? tokens.accessToken.substring(0, 20) + '...' : 'null',
      hasRefreshToken: !!tokens.refreshToken,
      hasIdToken: !!tokens.idToken,
      expiresAt: tokens.expiresAt,
      expiresAtDate: tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : 'null'
    })

    return tokens
  } catch (error) {
    console.error('[nativeTokenStorage] ❌ Failed to load tokens:', error)
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
  const native = isNative()
  console.log('[nativeTokenStorage] clearTokens() called, isNative:', native)

  if (!native) {
    console.log('[nativeTokenStorage] On web platform - skipping clear (no-op)')
    return
  }

  console.log('[nativeTokenStorage] Clearing tokens with key:', STORAGE_KEY)

  try {
    console.log('[nativeTokenStorage] Calling Preferences.remove...')
    await Preferences.remove({ key: STORAGE_KEY })

    console.log('[nativeTokenStorage] ✅ Preferences.remove completed successfully')
    console.log('[nativeTokenStorage] ✅ Tokens cleared from native storage')
  } catch (error) {
    console.error('[nativeTokenStorage] ❌ Failed to clear tokens:', error)
    // Don't throw - gracefully handle storage failures
  }
}
