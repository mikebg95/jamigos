/**
 * Application-wide constants
 * Centralized configuration for magic numbers, timeouts, and limits
 */

// ===== Timing Constants =====
export const TIMING = {
  // Spinner delay before showing loading indicator
  SPINNER_DELAY_MS: 200,

  // Request timeout (30 seconds)
  REQUEST_TIMEOUT_MS: 30000,

  // Keycloak token refresh buffer (seconds)
  TOKEN_REFRESH_BUFFER_SEC: 30,

  // Router component mount delay
  ROUTER_MOUNT_DELAY_MS: 50,
};

// ===== Validation Constants =====
export const VALIDATION = {
  // Maximum task description length
  MAX_TASK_LENGTH: 500,

  // Minimum task description length
  MIN_TASK_LENGTH: 1,

  // Maximum general description length
  MAX_DESCRIPTION_LENGTH: 1000,
};

// ===== UI Constants =====
export const UI = {
  // Icon sizes
  ICON_SIZE_SM: 20,
  ICON_SIZE_MD: 24,
  ICON_SIZE_LG: 32,
  ICON_SIZE_XL: 48,

  // Icon stroke widths
  ICON_STROKE_WIDTH: 2,
  ICON_STROKE_WIDTH_THIN: 1.5,
};

// ===== API Constants =====
export const API = {
  // Default pagination size
  DEFAULT_PAGE_SIZE: 50,

  // Maximum retry attempts
  MAX_RETRIES: 3,

  // API base paths
  BASE_PATH: '/api',
};

// ===== Accessibility Constants =====
export const A11Y = {
  // ARIA live region politeness levels
  LIVE_POLITE: 'polite',
  LIVE_ASSERTIVE: 'assertive',

  // Focus timeout after navigation
  FOCUS_TIMEOUT_MS: 100,
};

// ===== Sentry Constants =====
export const SENTRY = {
  // Environment (from env var or default to development)
  ENVIRONMENT: import.meta.env.MODE || 'development',

  // Enable Sentry only in production by default (can be overridden with env var)
  ENABLED: import.meta.env.VITE_SENTRY_ENABLED === 'true' || import.meta.env.MODE === 'production',

  // DSN from environment variable
  DSN: import.meta.env.VITE_SENTRY_DSN || '',

  // Sample rate for performance monitoring (0.0 to 1.0)
  TRACES_SAMPLE_RATE: 0.1,

  // Sample rate for session replay (0.0 to 1.0)
  REPLAYS_SESSION_SAMPLE_RATE: 0.1,

  // Sample rate for error session replay (0.0 to 1.0)
  REPLAYS_ON_ERROR_SAMPLE_RATE: 1.0,
};
