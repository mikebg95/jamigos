/**
 * DEV-ONLY: Native Token Storage Test Helpers
 *
 * This file is ONLY imported in development mode on native platforms.
 * It attaches test functions to the global window object for manual testing
 * via Safari/Chrome DevTools console.
 *
 * ⚠️ THIS IS TEMPORARY - Only for testing Step 1A token storage helpers.
 * Will be removed or refactored in later steps.
 *
 * Usage (in Safari Web Inspector or Chrome DevTools):
 *   window.testTokenStorageSave()   // Save dummy tokens
 *   window.testTokenStorageLoad()   // Load and log tokens
 *   window.testTokenStorageClear()  // Clear tokens
 *
 * @module devTokenStorageTest
 */

import { saveTokens, loadTokens, clearTokens } from './nativeTokenStorage.js'

/**
 * Initialize dev-only test helpers on window object
 */
export function initDevTokenStorageTest() {
  console.log('[DevTokenStorageTest] 🧪 Test helpers initialized. Available commands:')
  console.log('  window.testTokenStorageSave()')
  console.log('  window.testTokenStorageLoad()')
  console.log('  window.testTokenStorageClear()')

  /**
   * Save dummy tokens to native storage
   */
  window.testTokenStorageSave = async () => {
    console.log('[Test] 💾 Saving dummy tokens...')
    const dummyTokens = {
      accessToken: 'dummy-access-token-' + Date.now(),
      refreshToken: 'dummy-refresh-token-' + Date.now(),
      idToken: 'dummy-id-token-' + Date.now(),
      expiresAt: Date.now() + 600000 // 10 minutes from now
    }

    try {
      await saveTokens(dummyTokens)
      console.log('[Test] ✅ Tokens saved successfully:', dummyTokens)
      return dummyTokens
    } catch (error) {
      console.error('[Test] ❌ Save failed:', error)
      throw error
    }
  }

  /**
   * Load tokens from native storage and log result
   */
  window.testTokenStorageLoad = async () => {
    console.log('[Test] 📂 Loading tokens...')

    try {
      const tokens = await loadTokens()

      if (tokens) {
        console.log('[Test] ✅ Tokens loaded successfully:', tokens)

        // Check if expired (for debugging)
        const isExpired = tokens.expiresAt < Date.now()
        const expiresIn = Math.round((tokens.expiresAt - Date.now()) / 1000)

        console.log('[Test] Token expiry info:')
        console.log(`  Expired: ${isExpired}`)
        console.log(`  Expires ${isExpired ? 'ago' : 'in'}: ${Math.abs(expiresIn)} seconds`)
      } else {
        console.log('[Test] ℹ️ No tokens found in storage (this is OK if none were saved)')
      }

      return tokens
    } catch (error) {
      console.error('[Test] ❌ Load failed:', error)
      throw error
    }
  }

  /**
   * Clear all tokens from native storage
   */
  window.testTokenStorageClear = async () => {
    console.log('[Test] 🗑️ Clearing tokens...')

    try {
      await clearTokens()
      console.log('[Test] ✅ Tokens cleared successfully')

      // Verify by loading
      const tokens = await loadTokens()
      if (tokens === null) {
        console.log('[Test] ✅ Verified: storage is empty')
      } else {
        console.warn('[Test] ⚠️ Unexpected: tokens still present after clear:', tokens)
      }
    } catch (error) {
      console.error('[Test] ❌ Clear failed:', error)
      throw error
    }
  }

  /**
   * Run full test suite (save → load → verify → clear → verify)
   */
  window.testTokenStorageFull = async () => {
    console.log('[Test] 🧪 Running full test suite...\n')

    try {
      // 1. Save
      console.log('[Test] Step 1: Save dummy tokens')
      const savedTokens = await window.testTokenStorageSave()
      console.log('')

      // 2. Load and verify
      console.log('[Test] Step 2: Load tokens')
      const loadedTokens = await window.testTokenStorageLoad()
      console.log('')

      if (JSON.stringify(savedTokens) === JSON.stringify(loadedTokens)) {
        console.log('[Test] ✅ Tokens match! Save/Load working correctly')
      } else {
        console.error('[Test] ❌ Tokens mismatch!')
        console.error('  Saved:', savedTokens)
        console.error('  Loaded:', loadedTokens)
      }
      console.log('')

      // 3. Clear
      console.log('[Test] Step 3: Clear tokens')
      await window.testTokenStorageClear()
      console.log('')

      console.log('[Test] 🎉 Full test suite completed!')
    } catch (error) {
      console.error('[Test] ❌ Test suite failed:', error)
      throw error
    }
  }

  console.log('  window.testTokenStorageFull()   // Run complete test suite')
  console.log('')
}
