import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import keycloak from "./auth/keycloak";
import { CapacitorAuthHandler } from "./auth/capacitorAuth";
import { useUserStore } from "@/store/user.js";
import { useUiStore } from "@/store/ui.js";
import { initTheme } from "@/utils/theme.js";
import "@/scss/main.scss";

// Initialize theme before app mounts
initTheme();
import {
  AlertCircle,
  X,
  CheckSquare,
  LayoutGrid,
  Info,
  UserCircle,
  TrendingUp,
  Target,
  Sparkles,
  Lock,
  Zap,
  Globe,
  Palette,
  BarChart3,
} from "lucide-vue-next";
import usersService from "@/service/UsersService.js";
import * as Sentry from "@sentry/vue";
import { SENTRY } from "@/config/constants.js";

const pinia = createPinia();
const app = createApp(App);

// Initialize Sentry error tracking (production only by default)
if (SENTRY.ENABLED && SENTRY.DSN) {
  Sentry.init({
    app,
    dsn: SENTRY.DSN,
    environment: SENTRY.ENVIRONMENT,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: SENTRY.TRACES_SAMPLE_RATE,
    // Session Replay
    replaysSessionSampleRate: SENTRY.REPLAYS_SESSION_SAMPLE_RATE,
    replaysOnErrorSampleRate: SENTRY.REPLAYS_ON_ERROR_SAMPLE_RATE,
  });
}

app.use(pinia);
app.use(router);

// Register only the Lucide icons we use (optimizes bundle size)
const icons = {
  AlertCircle,
  X,
  CheckSquare,
  LayoutGrid,
  Info,
  UserCircle,
  TrendingUp,
  Target,
  Sparkles,
  Lock,
  Zap,
  Globe,
  Palette,
  BarChart3,
};

Object.entries(icons).forEach(([name, component]) => {
  app.component(name, component);
});

const uiStore = useUiStore();
uiStore.startLoading();

// Detect if running in Capacitor (mobile)
const isCapacitor = !!(window.Capacitor && window.Capacitor.getPlatform() !== 'web');

console.log('[Init] Platform detection:', {
    isCapacitor,
    platform: window.Capacitor?.getPlatform(),
    hasCapacitor: !!window.Capacitor
});

// Initialize authentication based on platform
async function initializeAuth() {
    const userStore = useUserStore();

    if (isCapacitor) {
        // Mobile: Use custom Capacitor auth handler with native browser
        console.log('[Init] Using Capacitor native auth flow');

        const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
        const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM;
        const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

        const authHandler = new CapacitorAuthHandler(
            KEYCLOAK_URL,
            KEYCLOAK_REALM,
            KEYCLOAK_CLIENT_ID
        );

        // Check for stored tokens
        const storedTokens = localStorage.getItem('keycloak_tokens');
        let tokens = storedTokens ? JSON.parse(storedTokens) : null;

        // Check if token exists and is not expired
        let needsNewToken = !tokens;
        if (tokens) {
            try {
                // Decode token to check expiration
                const tokenParts = tokens.access_token.split('.');
                const payload = JSON.parse(atob(tokenParts[1]));
                const exp = payload.exp;
                const now = Math.floor(Date.now() / 1000);

                // Token is expired if it expires in less than 60 seconds
                if (exp - now < 60) {
                    console.log('[Init] Token expired, clearing and requesting new login');
                    localStorage.removeItem('keycloak_tokens');
                    needsNewToken = true;
                } else {
                    console.log('[Init] Using stored tokens (expires in', exp - now, 'seconds)');
                }
            } catch (e) {
                console.error('[Init] Error validating stored token:', e);
                localStorage.removeItem('keycloak_tokens');
                needsNewToken = true;
            }
        }

        if (needsNewToken) {
            console.log('[Init] No valid tokens, triggering login');

            // Start login flow
            const tokens = await authHandler.login();
            console.log('[Init] Login successful');

            // Store tokens
            localStorage.setItem('keycloak_tokens', JSON.stringify(tokens));

            // Parse token
            const tokenParts = tokens.access_token.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));

            // Set up Keycloak instance
            keycloak.authenticated = true;
            keycloak.token = tokens.access_token;
            keycloak.refreshToken = tokens.refresh_token;
            keycloak.tokenParsed = payload;

            // Set user in store
            const resourceAccess = payload.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles || [];
            const realmAccess = payload.realm_access?.roles || [];
            const roles = [...resourceAccess, ...realmAccess];

            userStore.setUser(true, roles, payload);
        } else {
            // Parse token to get user info
            const tokenParts = tokens.access_token.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));

            console.log('[Init] Token payload:', payload);

            // Set up Keycloak instance manually for compatibility with existing code
            keycloak.authenticated = true;
            keycloak.token = tokens.access_token;
            keycloak.refreshToken = tokens.refresh_token;
            keycloak.tokenParsed = payload;

            // Update Keycloak refresh token method to use our handler
            keycloak.updateToken = async (minValidity = 30) => {
                const exp = payload.exp;
                const now = Math.floor(Date.now() / 1000);
                if (exp - now < minValidity) {
                    console.log('[Init] Token expired, refreshing...');
                    const newTokens = await authHandler.refreshToken(tokens.refresh_token);
                    localStorage.setItem('keycloak_tokens', JSON.stringify(newTokens));
                    keycloak.token = newTokens.access_token;
                    keycloak.refreshToken = newTokens.refresh_token;
                    const newPayload = JSON.parse(atob(newTokens.access_token.split('.')[1]));
                    keycloak.tokenParsed = newPayload;
                    return true;
                }
                return false;
            };

            // Set user in store
            const resourceAccess = payload.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles || [];
            const realmAccess = payload.realm_access?.roles || [];
            const roles = [...resourceAccess, ...realmAccess];

            userStore.setUser(
                true,
                roles,
                payload
            );
        }

    } else {
        // Web: Use standard Keycloak JS adapter
        console.log('[Init] Using standard Keycloak web auth flow');

        const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

        const keycloakConfig = {
            onLoad: "check-sso",
            pkceMethod: "S256",
            checkLoginIframe: false,
            silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        };

        console.log('[Init] Keycloak config:', keycloakConfig);

        const authenticated = await keycloak.init(keycloakConfig);
        console.log('[Init] Keycloak init succeeded, authenticated:', authenticated);

        // Extract roles from both resource_access and realm_access (same as mobile)
        const resourceAccess = keycloak.tokenParsed?.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles || [];
        const realmAccess = keycloak.tokenParsed?.realm_access?.roles || [];
        const roles = [...resourceAccess, ...realmAccess];

        userStore.setUser(
            keycloak.authenticated,
            roles,
            keycloak.tokenParsed
        );
    }

    // Sync user if authenticated
    if (userStore.isAuthenticated) {
        try {
            await usersService.syncCurrentUser();
        } catch (e) {
            console.warn('users/sync failed (will fallback to JIT):', e);
        }
    }

    // Redirect to dashboard if authenticated and on home page
    if (router.currentRoute.value.path === "/" && userStore.isAuthenticated) {
        await router.replace("/dashboard");
    }
}

// Start authentication
initializeAuth()
    .then(() => {
        console.log('[Init] Authentication complete, mounting app');
        app.mount("#app");
    })
    .catch((error) => {
        console.error('[Init] Authentication failed:', error);
        console.error('[Init] Error details:', {
            message: error.message,
            stack: error.stack,
            error: JSON.stringify(error, null, 2)
        });

        const errorMsg = error.message || 'Unknown authentication error';
        alert(`Authentication failed: ${errorMsg}\n\nPlease check:\n1. Internet connection\n2. Keycloak server is reachable\n3. Redirect URIs configured in Keycloak`);
        app.mount("#app");
    })
    .finally(() => {
        uiStore.stopLoading();
    });