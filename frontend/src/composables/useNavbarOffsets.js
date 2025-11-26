/**
 * useNavbarOffsets Composable
 *
 * Measures the actual rendered heights of top and bottom navbars
 * and updates CSS variables that overlays use for positioning.
 *
 * This ensures overlays always cover the exact area between navbars,
 * regardless of device, safe-area-insets, or browser rendering differences.
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Capacitor } from '@capacitor/core'

// Mobile breakpoint (matches $breakpoint-md in SCSS)
const MOBILE_BREAKPOINT = 768

// Tiny adjustment for mobile web bottom offset to prevent blur overlap
// (accounts for sub-pixel rendering differences on actual mobile browsers)
const MOBILE_WEB_BOTTOM_ADJUSTMENT = 4

export function useNavbarOffsets() {
  const topNavbarHeight = ref(0)
  const bottomNavbarHeight = ref(0)

  /**
   * Detect if we're in mobile web browser (not native app, small viewport)
   */
  const isMobileWeb = () => {
    const isNative = Capacitor.isNativePlatform()
    const isMobileViewport = window.innerWidth <= MOBILE_BREAKPOINT
    return !isNative && isMobileViewport
  }

  /**
   * Measure the actual DOM heights of navbars and update CSS variables
   */
  const measureAndUpdate = () => {
    // Measure top navbar
    const topNavbar = document.getElementById('top-navbar')
    if (topNavbar) {
      const rect = topNavbar.getBoundingClientRect()
      topNavbarHeight.value = rect.height

      // Update CSS variable on root element (no adjustment needed for top)
      document.documentElement.style.setProperty('--navbar-top-offset', `${rect.height}px`)
    }

    // Measure bottom navbar (might not exist on desktop)
    const bottomNavbar = document.getElementById('bottom-navbar')
    if (bottomNavbar) {
      const rect = bottomNavbar.getBoundingClientRect()
      bottomNavbarHeight.value = rect.height

      // Calculate bottom offset with mobile web adjustment if needed
      let bottomOffset = rect.height

      // Mobile web browsers need a tiny fudge factor to prevent blur overlap
      // (sub-pixel rendering differences between desktop devtools and actual mobile browsers)
      if (isMobileWeb()) {
        bottomOffset += MOBILE_WEB_BOTTOM_ADJUSTMENT
      }

      // Update CSS variable on root element
      document.documentElement.style.setProperty('--navbar-bottom-offset', `${bottomOffset}px`)
    } else {
      // Bottom navbar doesn't exist (desktop) - set to 0
      bottomNavbarHeight.value = 0
      document.documentElement.style.setProperty('--navbar-bottom-offset', '0px')
    }

    // Debug logging (can be removed in production)
    console.log('[useNavbarOffsets] Measured heights:', {
      top: topNavbarHeight.value,
      bottom: bottomNavbarHeight.value,
      isMobileWeb: isMobileWeb(),
      bottomOffsetApplied: bottomNavbar ? (isMobileWeb() ? bottomNavbarHeight.value + MOBILE_WEB_BOTTOM_ADJUSTMENT : bottomNavbarHeight.value) : 0
    })
  }

  /**
   * Debounced resize handler to avoid excessive recalculations
   */
  let resizeTimeout = null
  const handleResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }

    resizeTimeout = setTimeout(() => {
      measureAndUpdate()
    }, 100) // Wait 100ms after resize stops
  }

  /**
   * Initialize measurements and set up listeners
   */
  onMounted(() => {
    // Initial measurement - use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      // Double RAF to ensure styles are applied and layout is complete
      requestAnimationFrame(() => {
        measureAndUpdate()
      })
    })

    // Re-measure on window resize
    window.addEventListener('resize', handleResize)

    // Re-measure on orientation change (mobile devices)
    window.addEventListener('orientationchange', measureAndUpdate)
  })

  /**
   * Clean up listeners
   */
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', measureAndUpdate)

    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
  })

  return {
    topNavbarHeight,
    bottomNavbarHeight,
    measureAndUpdate // Expose for manual re-measurement if needed
  }
}
