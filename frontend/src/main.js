import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import keycloak from "./auth/keycloak";
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

keycloak
    .init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`, // redirect to silent-check-sso.html
    })
    .then(async () => {
        const userStore = useUserStore();
        userStore.setUser(
            keycloak.authenticated,
            keycloak.tokenParsed?.realm_access?.roles || [],
            keycloak.tokenParsed
        );

        if (userStore.isAuthenticated) {
            try {
                await usersService.syncCurrentUser();
            } catch (e) {
                console.warn('users/sync failed (will fallback to JIT):', e);
            }
        }

        if (router.currentRoute.value.path === "/" && userStore.isAuthenticated) {
            await router.replace("/dashboard");
        }

        app.mount("#app");
    })
    .finally(() => {
        uiStore.stopLoading();
    });