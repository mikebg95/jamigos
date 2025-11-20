/**
 * Keycloak Theme Detector
 * Detects and applies the theme from URL parameter or localStorage
 * This syncs the Keycloak pages with the main app's theme preference
 */

(function() {
  'use strict';

  const THEME_KEY = 'app-theme';
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
  };

  /**
   * Get theme from URL parameter in current page
   * @returns {string|null}
   */
  function getThemeFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const theme = urlParams.get('theme');

      if (theme === THEMES.LIGHT || theme === THEMES.DARK) {
        return theme;
      }

      return null;
    } catch (e) {
      console.warn('Failed to parse URL parameters:', e);
      return null;
    }
  }

  /**
   * Extract theme from redirect_uri parameter in the URL
   * Keycloak passes the redirect_uri as a parameter, which may contain the theme
   * @returns {string|null}
   */
  function getThemeFromRedirectUri() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUri = urlParams.get('redirect_uri');

      if (redirectUri) {
        const redirectUrl = new URL(redirectUri);
        const theme = redirectUrl.searchParams.get('theme');

        if (theme === THEMES.LIGHT || theme === THEMES.DARK) {
          return theme;
        }
      }

      return null;
    } catch (e) {
      console.warn('Failed to parse redirect_uri:', e);
      return null;
    }
  }

  /**
   * Extract theme from client_data in form action
   * Keycloak encodes redirect info in base64 client_data
   * @returns {string|null}
   */
  function getThemeFromClientData() {
    try {
      // Find the login form
      const form = document.getElementById('kc-form-login') ||
                   document.getElementById('kc-register-form') ||
                   document.querySelector('form[action*="client_data"]');

      if (!form) {
        return null;
      }

      const formAction = form.getAttribute('action');
      if (!formAction) {
        return null;
      }

      // Extract client_data parameter from form action
      const actionUrl = new URL(formAction, window.location.origin);
      const clientData = actionUrl.searchParams.get('client_data');

      if (!clientData) {
        return null;
      }

      // Decode base64 client_data
      const decodedData = JSON.parse(atob(clientData));

      // Extract redirect URI (ru = redirect URI)
      const redirectUri = decodedData.ru;
      if (!redirectUri) {
        return null;
      }

      // Parse the redirect URI to get theme parameter
      const redirectUrl = new URL(redirectUri, window.location.origin);
      const theme = redirectUrl.searchParams.get('theme');

      if (theme === THEMES.LIGHT || theme === THEMES.DARK) {
        return theme;
      }

      return null;
    } catch (e) {
      console.warn('Failed to parse client_data:', e);
      return null;
    }
  }

  /**
   * Get theme from localStorage
   * @returns {string|null}
   */
  function getThemeFromStorage() {
    try {
      const stored = localStorage.getItem(THEME_KEY);

      if (stored === THEMES.LIGHT || stored === THEMES.DARK) {
        return stored;
      }

      return null;
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
      return null;
    }
  }

  /**
   * Get system theme preference
   * @returns {string}
   */
  function getSystemTheme() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return THEMES.DARK;
      }
    } catch (e) {
      console.warn('Failed to detect system theme:', e);
    }

    return THEMES.LIGHT;
  }

  /**
   * Apply theme to the document
   * @param {string} theme
   */
  function applyTheme(theme) {
    if (theme !== THEMES.LIGHT && theme !== THEMES.DARK) {
      console.warn('Invalid theme:', theme);
      theme = THEMES.LIGHT;
    }

    // Set data-theme attribute on html element
    document.documentElement.setAttribute('data-theme', theme);

    // Store in localStorage for persistence
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  }

  /**
   * Initialize theme
   */
  function initTheme() {
    // Priority:
    // 1. URL parameter (from direct link with ?theme=)
    // 2. redirect_uri parameter (from Keycloak auth flow)
    // 3. client_data in form action (from Keycloak login/register forms)
    // 4. localStorage (previously saved preference)
    // 5. System preference (default)

    const urlTheme = getThemeFromUrl();
    const redirectTheme = getThemeFromRedirectUri();
    const clientDataTheme = getThemeFromClientData();
    const storedTheme = getThemeFromStorage();
    const systemTheme = getSystemTheme();

    const theme = urlTheme || redirectTheme || clientDataTheme || storedTheme || systemTheme;

    applyTheme(theme);
  }

  /**
   * Try to detect theme from form when it's available
   */
  function tryDetectFromForm() {
    const clientDataTheme = getThemeFromClientData();
    if (clientDataTheme) {
      applyTheme(clientDataTheme);
    }
  }

  // Initialize immediately (before DOMContentLoaded) to avoid flash
  initTheme();

  // Also initialize on DOMContentLoaded to catch form data
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      tryDetectFromForm();
    });
  } else {
    // Document already loaded, try immediately
    tryDetectFromForm();
  }
})();
