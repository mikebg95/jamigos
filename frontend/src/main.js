import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import authFacade from "./auth/authFacade.js";
import { useUserStore } from "@/store/user.js";
import { useUiStore } from "@/store/ui.js";
import { initTheme } from "@/utils/theme.js";
import { initializeDeepLinkHandler } from "@/utils/deepLinkHandler.js";
import { Capacitor } from "@capacitor/core";
import "@/scss/main.scss";

// Initialize theme before app mounts
initTheme();

// Disable zoom in Capacitor mobile app ONLY (not web)
if (Capacitor.isNativePlatform()) {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
    );
  }
  // Add native-app class for additional touch-action styling
  document.body.classList.add('native-app');
}

// Initialize deep link handler for mobile (no-op on web)
initializeDeepLinkHandler();

// Initialize token storage test helpers (mobile only, when enabled)
// Enabled when: native platform AND (dev mode OR VITE_ENABLE_MOBILE_TOKEN_TESTS=true)
const enableMobileTokenTests =
  Capacitor.isNativePlatform() &&
  (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOBILE_TOKEN_TESTS === 'true');

if (enableMobileTokenTests) {
  console.log('[Main] Loading token storage test helpers (enableMobileTokenTests=true)');
  import('./auth/mobile/devTokenStorageTest.js')
    .then((module) => {
      module.initDevTokenStorageTest();
      console.log('[Main] Token storage test helpers loaded successfully');
    })
    .catch((error) => {
      console.error('[Main] Failed to load token storage test helpers:', error);
    });
}
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

// DEBUG HELPERS (Native only)
if (Capacitor.isNativePlatform()) {
  // Manual initAuth() debug helper
  window.debugInitAuth = async function() {
    console.log('[DebugInitAuth] ===== MANUAL initAuth() START =====');
    try {
      const result = await authFacade.initAuth();
      console.log('[DebugInitAuth] initAuth() resolved with:', result);

      const userStore = useUserStore();
      console.log('[DebugInitAuth] userStore.isAuthenticated:', userStore.isAuthenticated);
      console.log('[DebugInitAuth] userStore.roles:', userStore.roles);
      console.log('[DebugInitAuth] userStore.tokenParsed:', userStore.tokenParsed);

      return {
        initAuthResult: result,
        userStoreDump: {
          isAuthenticated: userStore.isAuthenticated,
          roles: userStore.roles,
          tokenParsed: userStore.tokenParsed
        }
      };
    } catch (error) {
      console.error('[DebugInitAuth] initAuth() threw:', error);
      throw error;
    }
  };

  // UserStore state dump helper
  window.debugUserStore = function() {
    const userStore = useUserStore();
    const dump = {
      isAuthenticated: userStore.isAuthenticated,
      roles: userStore.roles,
      tokenParsed: userStore.tokenParsed
    };
    console.log('[DebugUserStore] Current userStore state:', dump);
    return dump;
  };

  console.log('[Main] Debug helpers attached: window.debugInitAuth(), window.debugUserStore()');
}

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

// Initialize auth via facade (automatically uses correct provider based on platform)
console.log('[Main] ===== Calling authFacade.initAuth() from main.js =====');
authFacade
    .initAuth()
    .then(async (authUser) => {
        console.log('[Main] authFacade.initAuth() resolved with:', authUser);

        const userStore = useUserStore();
        userStore.setUser(
            authUser.authenticated,
            authUser.roles,
            authUser.tokenParsed
        );

        console.log('[Main] After userStore.setUser: isAuthenticated =', userStore.isAuthenticated);
        console.log('[Main] After userStore.setUser: roles =', userStore.roles);
        console.log('[Main] After userStore.setUser: tokenParsed =', userStore.tokenParsed);

        if (userStore.isAuthenticated) {
            try {
                await usersService.syncCurrentUser();
            } catch (e) {
                console.warn('users/sync failed (will fallback to JIT):', e);
            }
        }

        // Post-initAuth redirect logic (platform-specific)
        const currentPath = router.currentRoute.value.path;
        console.log('[Main] Post-initAuth redirect check...');
        console.log('[Main]   Current path:', currentPath);
        console.log('[Main]   isAuthenticated:', userStore.isAuthenticated);
        console.log('[Main]   isNative:', Capacitor.isNativePlatform());

        if (Capacitor.isNativePlatform()) {
            // NATIVE ONLY: Handle post-initAuth redirects after userStore is hydrated
            if (userStore.isAuthenticated) {
                // Authenticated: redirect to /dashboard from / or /mobile-auth
                if (currentPath === "/" || currentPath === "/mobile-auth") {
                    console.log('[Main] NATIVE: Authenticated user on', currentPath, '→ redirecting to /dashboard');
                    await router.replace("/dashboard");
                } else {
                    console.log('[Main] NATIVE: Authenticated user on', currentPath, '→ no redirect needed');
                }
            } else {
                // Not authenticated: redirect to /mobile-auth from /
                if (currentPath === "/") {
                    console.log('[Main] NATIVE: Unauthenticated user on / → redirecting to /mobile-auth');
                    await router.replace("/mobile-auth");
                } else {
                    console.log('[Main] NATIVE: Unauthenticated user on', currentPath, '→ no redirect needed');
                }
            }
        } else {
            // WEB ONLY: Existing behavior - authenticated users on / redirect to /dashboard
            if (currentPath === "/" && userStore.isAuthenticated) {
                console.log('[Main] WEB: Authenticated user on / → redirecting to /dashboard');
                await router.replace("/dashboard");
            } else {
                console.log('[Main] WEB: No redirect needed');
            }
        }

        app.mount("#app");
    })
    .catch((error) => {
        console.error('[Main] authFacade.initAuth() FAILED:', error);
        // Mount app anyway so user sees something instead of black screen
        alert(`Authentication initialization failed: ${error.message}\n\nThe app will load but you may need to refresh.`);
        app.mount("#app");
    })
    .finally(() => {
        uiStore.stopLoading();
    });
