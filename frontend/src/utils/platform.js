/**
 * Platform Detection Utility
 *
 * Provides centralized platform detection for differentiating between
 * web browser and native Capacitor app (iOS/Android) environments.
 */

import { Capacitor } from '@capacitor/core';

/**
 * Check if running in a native mobile app (iOS or Android via Capacitor)
 *
 * @returns {boolean} True if running in native app, false if running in web browser
 *
 * @example
 * if (isNativeApp()) {
 *   // Native-specific behavior (iOS/Android)
 * } else {
 *   // Web-specific behavior
 * }
 */
export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

/**
 * Get the current platform
 *
 * @returns {'ios' | 'android' | 'web'} Current platform name
 *
 * @example
 * const platform = getPlatform();
 * if (platform === 'ios') {
 *   // iOS-specific code
 * }
 */
export function getPlatform() {
  return Capacitor.getPlatform();
}
