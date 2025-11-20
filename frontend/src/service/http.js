import authFacade from '@/auth/authFacade.js';
import router from '@/router';
import { useUiStore } from '@/store/ui.js';
import { TIMING } from '@/config/constants';
import * as Sentry from '@sentry/vue';
import { deduplicateRequest } from '@/utils/requestCache.js';
import { getTheme } from '@/utils/theme.js';

// API base URL logic:
// - When VITE_API_BASE_URL is set (mobile builds), construct full URLs: VITE_API_BASE_URL + path
// - When VITE_API_BASE_URL is not set (web dev/prod), use relative paths: /api → Nginx proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function buildUrl(path) {
    // If API_BASE_URL is set, construct full URL (for mobile)
    // Otherwise, return path as-is (for web with Nginx proxy)
    return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

async function getValidToken() {
    try {
        return await authFacade.getAccessToken();
    } catch (err) {
        // Log token refresh failures for debugging
        if (import.meta.env.DEV) {
            console.warn('Token refresh failed:', err);
        }
        throw err;
    }
}

export async function apiFetch(path, options = {}) {
    const ui = useUiStore();
    ui.startLoading();

    // Deduplicate identical requests
    return deduplicateRequest(path, options, async () => {
        // Create AbortController for timeout functionality
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMING.REQUEST_TIMEOUT_MS);

        try {
            const token = await getValidToken();
            const headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            };

            const url = buildUrl(path);
            const res = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });

            if (res.status === 401) {
                const theme = getTheme();
                sessionStorage.setItem('pending-auth-theme', theme);
                const redirectPath = `${window.location.pathname}?theme=${theme}`;
                authFacade.login(redirectPath);
                return;
            }

            if (res.status === 403) {
                router.push('/forbidden');
                return;
            }

            if (!res.ok) {
                const error = new Error(`${options.method || 'GET'} ${url} -> ${res.status}`);

                // Send HTTP errors to Sentry (except auth errors which are expected)
                if (res.status !== 401 && res.status !== 403) {
                    Sentry.captureException(error, {
                        tags: {
                            type: 'api_error',
                        },
                        contexts: {
                            http: {
                                method: options.method || 'GET',
                                url: url,
                                status_code: res.status,
                            },
                        },
                    });
                }

                throw error;
            }

            const ct = res.headers.get('content-type') || '';
            return ct.includes('application/json') ? res.json() : res.text();
        } catch (err) {
            // Handle timeout errors with user-friendly message
            if (err.name === 'AbortError') {
                const timeoutError = new Error('Request timeout - please check your connection and try again');

                // Send timeout errors to Sentry
                Sentry.captureException(timeoutError, {
                    tags: {
                        type: 'timeout',
                    },
                    contexts: {
                        http: {
                            method: options.method || 'GET',
                            url: buildUrl(path),
                        },
                    },
                });

                throw timeoutError;
            }
            throw err;
        } finally {
            clearTimeout(timeoutId);
            ui.stopLoading();
        }
    });
}

