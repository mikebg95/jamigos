import keycloak from '@/auth/keycloak';
import router from '@/router';
import { useUiStore } from '@/store/ui.js';
import { TIMING } from '@/config/constants';
import * as Sentry from '@sentry/vue';
import { deduplicateRequest } from '@/utils/requestCache.js';
import { getTheme } from '@/utils/theme.js';

async function getValidToken() {
    await keycloak.updateToken(TIMING.TOKEN_REFRESH_BUFFER_SEC).catch((err) => {
        // Log token refresh failures for debugging
        if (import.meta.env.DEV) {
            console.warn('Token refresh failed:', err);
        }
        // Sentry could track this if needed
    });
    if (!keycloak.authenticated) throw new Error('Not authenticated');
    return keycloak.token;
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

            const res = await fetch(path, {
                ...options,
                headers,
                signal: controller.signal,
            });

            if (res.status === 401) {
                const theme = getTheme();
                sessionStorage.setItem('pending-auth-theme', theme);
                const redirectUri = `${window.location.origin}${window.location.pathname}?theme=${theme}`;
                keycloak.login({ redirectUri });
                return;
            }

            if (res.status === 403) {
                router.push('/forbidden');
                return;
            }

            if (!res.ok) {
                const error = new Error(`${options.method || 'GET'} ${path} -> ${res.status}`);

                // Send HTTP errors to Sentry (except auth errors which are expected)
                if (res.status !== 401 && res.status !== 403) {
                    Sentry.captureException(error, {
                        tags: {
                            type: 'api_error',
                        },
                        contexts: {
                            http: {
                                method: options.method || 'GET',
                                url: path,
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
                            url: path,
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

