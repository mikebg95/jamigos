/**
 * Theme Utility
 * Manages light/dark theme switching for the design system
 *
 * WEB: User can manually toggle theme, choice is persisted in localStorage
 * MOBILE: Theme automatically follows device system appearance, no manual toggle
 */

import { isNativeApp } from './platform.js';

const THEME_KEY = 'app-theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * Get the system theme from prefers-color-scheme
 * @returns {'light' | 'dark'}
 */
function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEMES.DARK;
  }
  return THEMES.LIGHT;
}

/**
 * Get the current theme
 *
 * WEB: Returns user's saved preference from localStorage, or system preference as fallback
 * MOBILE: Always returns system theme (ignores localStorage)
 *
 * @returns {'light' | 'dark'}
 */
export function getTheme() {
  // MOBILE: Always follow system theme
  if (isNativeApp()) {
    return getSystemTheme();
  }

  // WEB: Use saved preference, fallback to system
  const stored = localStorage.getItem(THEME_KEY);

  if (stored && (stored === THEMES.LIGHT || stored === THEMES.DARK)) {
    return stored;
  }

  // No saved preference, use system
  return getSystemTheme();
}

/**
 * Set the theme
 *
 * WEB: Saves to localStorage and applies to DOM
 * MOBILE: Only applies to DOM (does not persist, system is source of truth)
 *
 * @param {'light' | 'dark'} theme
 */
export function setTheme(theme) {
  if (theme !== THEMES.LIGHT && theme !== THEMES.DARK) {
    console.warn(`Invalid theme: ${theme}. Using light theme.`);
    theme = THEMES.LIGHT;
  }

  // WEB: Save user preference to localStorage
  if (!isNativeApp()) {
    localStorage.setItem(THEME_KEY, theme);
  }
  // MOBILE: Don't save to localStorage, system is source of truth

  // Apply theme to DOM (both web and mobile)
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Toggle between light and dark theme
 * @returns {'light' | 'dark'} The new theme
 */
export function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  setTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme on app load
 *
 * WEB: Applies saved theme or system preference
 * MOBILE: Applies system theme AND sets up listener for system theme changes
 */
export function initTheme() {
  const theme = getTheme();
  setTheme(theme);

  // MOBILE: Watch for system theme changes and update automatically
  if (isNativeApp()) {
    watchSystemTheme((newTheme) => {
      console.log('[Theme] System theme changed to:', newTheme);
      setTheme(newTheme);
    });
  }
  // WEB: Don't watch system changes, user preference takes precedence
}

/**
 * Listen to system theme changes
 * @param {Function} callback - Called when system theme changes
 * @returns {Function} Cleanup function to remove listener
 */
export function watchSystemTheme(callback) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = (e) => {
    const theme = e.matches ? THEMES.DARK : THEMES.LIGHT;
    callback(theme);
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Fallback for older browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}

export { THEMES };
