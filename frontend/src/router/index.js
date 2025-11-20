import { createRouter, createWebHistory } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import Home from '../views/HomeView.vue'
import Information from '../views/InformationView.vue'
import Dashboard from '../views/DashboardView.vue'
import Forbidden from '../views/ForbiddenView.vue'
import PageNotFound from '../views/PageNotFoundView.vue'
import Todo from "@/views/TodoView.vue";
import Profile from "@/views/ProfileView.vue"
import Messages from "@/views/MessagesView.vue"
import Explore from "@/views/ExploreView.vue"
import MobileAuthEntry from "@/views/MobileAuthEntryView.vue"
import {useUserStore} from "@/store/user.js";

// Detect if running on native mobile (Capacitor)
const isNative = Capacitor.isNativePlatform();

const routes = [
    {
        path: '/',
        component: Home,
        meta: { requiresAuth: false }
    },
    {
        path: '/mobile-auth',
        name: 'MobileAuthEntry',
        component: MobileAuthEntry,
        meta: { requiresAuth: false }
    },
    {
        path: '/info',
        component: Information,
        meta: { requiresAuth: true }
    },
    {
        path: '/dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/forbidden',
        component: Forbidden,
        meta: { requiresAuth: false }
    },
    {
        path: '/not-found',
        component: PageNotFound,
        meta: { requiresAuth: false }
    },
    {
        path: '/profile',
        component: Profile,
        meta: { requiresAuth: true }
    },
    {
        path: '/todo',
        component: Todo,
        meta: { requiresAuth: true }
    },
    {
        path: '/messages',
        component: Messages,
        meta: { requiresAuth: true }
    },
    {
        path: '/explore',
        component: Explore,
        meta: { requiresAuth: true }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();

    // MOBILE ONLY: Redirect away from HomeView (marketing landing page)
    // HomeView is web-only; mobile app should never show it
    if (isNative && to.path === "/") {
        if (userStore.isAuthenticated) {
            // Authenticated mobile users go to main app
            console.log('[Router] Mobile: Authenticated user accessing /, redirecting to /dashboard');
            return next("/dashboard");
        } else {
            // Logged-out mobile users go to mobile auth entry
            console.log('[Router] Mobile: Unauthenticated user accessing /, redirecting to /mobile-auth');
            return next("/mobile-auth");
        }
    }

    // WEB: If user is logged in, homepage redirects to dashboard (existing behavior)
    if (!isNative && to.path === "/" && userStore.isAuthenticated) {
        return next("/dashboard");
    }

    // Standard auth guard: routes requiring auth redirect to appropriate entry point
    if (to.meta?.requiresAuth && !userStore.isAuthenticated) {
        if (isNative) {
            // Mobile: redirect to mobile auth entry
            console.log('[Router] Mobile: Auth required, redirecting to /mobile-auth');
            return next("/mobile-auth");
        } else {
            // Web: redirect to home/landing page
            return next("/");
        }
    }

    // Allow navigation
    return next();
});

export default router