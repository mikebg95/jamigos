/**
 * Theme Utility
 * Manages light/dark theme switching for the design system
 */

const THEME_KEY = 'app-theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * Get the current theme from localStorage or system preference
 * @returns {'light' | 'dark'}
 */
export function getTheme() {
  const stored = localStorage.getItem(THEME_KEY);

  if (stored && (stored === THEMES.LIGHT || stored === THEMES.DARK)) {
    return stored;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEMES.DARK;
  }

  return THEMES.LIGHT;
}

/**
 * Set the theme
 * @param {'light' | 'dark'} theme
 */
export function setTheme(theme) {
  if (theme !== THEMES.LIGHT && theme !== THEMES.DARK) {
    console.warn(`Invalid theme: ${theme}. Using light theme.`);
    theme = THEMES.LIGHT;
  }

  localStorage.setItem(THEME_KEY, theme);
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
 */
export function initTheme() {
  const theme = getTheme();
  setTheme(theme);
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
