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

// Web-specific adjustments
// Tiny adjustment for mobile web bottom offset to prevent blur overlap
// (accounts for sub-pixel rendering differences on actual mobile browsers)
const MOBILE_WEB_BOTTOM_ADJUSTMENT = 4

// Native app (Capacitor) specific adjustments
// In Capacitor WebView, getBoundingClientRect() may measure navbar heights
// before safe-area-inset padding is fully applied, causing overlay misalignment.
// These corrections ensure overlays start/end exactly at navbar boundaries.
const NATIVE_TOP_ADJUSTMENT = 0     // Additional pixels to push overlay down (avoid blurring top navbar)
const NATIVE_BOTTOM_ADJUSTMENT = 0  // Additional pixels to push overlay up (avoid blurring bottom navbar)

export function useNavbarOffsets() {
  const topNavbarHeight = ref(0)
  const bottomNavbarHeight = ref(0)

  /**
   * Detect if we're running in native mobile app (Capacitor WebView)
   */
  const isNativeApp = () => {
    return Capacitor.isNativePlatform()
  }

  /**
   * Detect if we're in mobile web browser (not native app, small viewport)
   */
  const isMobileWeb = () => {
    const isNative = isNativeApp()
    const isMobileViewport = window.innerWidth <= MOBILE_BREAKPOINT
    return !isNative && isMobileViewport
  }

  /**
   * Measure the actual DOM heights of navbars and update CSS variables
   */
  const measureAndUpdate = () => {
    console.log('=== [useNavbarOffsets] measureAndUpdate CALLED ===')
    console.log('Capacitor.isNativePlatform():', Capacitor.isNativePlatform())
    console.log('window.innerWidth:', window.innerWidth)

    const native = isNativeApp()
    const mobileWeb = isMobileWeb()

    console.log('Detected platform - native:', native, 'mobileWeb:', mobileWeb)

    // Measure top navbar
    const topNavbar = document.getElementById('top-navbar')
    if (topNavbar) {
      const rect = topNavbar.getBoundingClientRect()
      const measuredHeight = rect.height
      topNavbarHeight.value = measuredHeight

      // Calculate top offset with platform-specific adjustments
      let topOffset = measuredHeight

      // Native apps: WebView may measure before safe-area is fully applied
      // Add adjustment to ensure overlay starts exactly below navbar
      if (native) {
        console.log(`NATIVE: Adding ${NATIVE_TOP_ADJUSTMENT}px to top offset`)
        topOffset += NATIVE_TOP_ADJUSTMENT
      }
      // Web: use measured height as-is (works correctly in all browsers)

      console.log(`Setting --navbar-top-offset to ${topOffset}px (measured: ${measuredHeight}px)`)

      // Update CSS variable on root element
      document.documentElement.style.setProperty('--navbar-top-offset', `${topOffset}px`)
    }

    // Measure bottom navbar (might not exist on desktop)
    const bottomNavbar = document.getElementById('bottom-navbar')
    if (bottomNavbar) {
      const rect = bottomNavbar.getBoundingClientRect()
      const measuredHeight = rect.height
      bottomNavbarHeight.value = measuredHeight

      // Calculate bottom offset with platform-specific adjustments
      let bottomOffset = measuredHeight

      if (native) {
        // Native apps: WebView measurement doesn't account for full safe-area-inset-bottom
        // Add adjustment to ensure overlay ends exactly above navbar
        console.log(`NATIVE: Adding ${NATIVE_BOTTOM_ADJUSTMENT}px to bottom offset`)
        bottomOffset += NATIVE_BOTTOM_ADJUSTMENT
      } else if (mobileWeb) {
        // Mobile web browsers: sub-pixel rendering differences
        // Use existing small fudge factor
        console.log(`MOBILE WEB: Adding ${MOBILE_WEB_BOTTOM_ADJUSTMENT}px to bottom offset`)
        bottomOffset += MOBILE_WEB_BOTTOM_ADJUSTMENT
      }
      // Desktop web: use measured height as-is

      console.log(`Setting --navbar-bottom-offset to ${bottomOffset}px (measured: ${measuredHeight}px)`)

      // Update CSS variable on root element
      document.documentElement.style.setProperty('--navbar-bottom-offset', `${bottomOffset}px`)
    } else {
      // Bottom navbar doesn't exist (desktop) - set to 0
      bottomNavbarHeight.value = 0
      document.documentElement.style.setProperty('--navbar-bottom-offset', '0px')
    }

    // Debug logging to help verify behavior across platforms
    if (native) {
      console.log('[useNavbarOffsets] Native app measurements:', {
        platform: 'native',
        topMeasured: topNavbar ? topNavbar.getBoundingClientRect().height : 0,
        topApplied: topNavbar ? topNavbar.getBoundingClientRect().height + NATIVE_TOP_ADJUSTMENT : 0,
        bottomMeasured: bottomNavbar ? bottomNavbar.getBoundingClientRect().height : 0,
        bottomApplied: bottomNavbar ? bottomNavbar.getBoundingClientRect().height + NATIVE_BOTTOM_ADJUSTMENT : 0
      })
    } else {
      console.log('[useNavbarOffsets] Web measurements:', {
        platform: mobileWeb ? 'mobile-web' : 'desktop-web',
        top: topNavbarHeight.value,
        bottom: bottomNavbarHeight.value,
        bottomOffsetApplied: bottomNavbar ? (mobileWeb ? bottomNavbarHeight.value + MOBILE_WEB_BOTTOM_ADJUSTMENT : bottomNavbarHeight.value) : 0
      })
    }
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
    // Capacitor WebView needs extra time for navbars to fully render
    // Web browsers can use RAF, but native needs a longer delay
    if (isNativeApp()) {
      console.log('[useNavbarOffsets] Native app detected - using delayed measurement')
      // Try multiple measurements to catch when navbars are ready
      setTimeout(() => measureAndUpdate(), 100)
      setTimeout(() => measureAndUpdate(), 300)
      setTimeout(() => measureAndUpdate(), 500)
    } else {
      // Web: use RAF (faster)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          measureAndUpdate()
        })
      })
    }

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
