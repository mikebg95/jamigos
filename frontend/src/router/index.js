import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import Information from '../views/InformationView.vue'
import Dashboard from '../views/DashboardView.vue'
import Forbidden from '../views/ForbiddenView.vue'
import PageNotFound from '../views/PageNotFoundView.vue'
import Todo from "@/views/TodoView.vue";
import Profile from "@/views/ProfileView.vue"
import Messages from "@/views/MessagesView.vue"
import Explore from "@/views/ExploreView.vue"
import {useUserStore} from "@/store/user.js";

const routes = [
    {
        path: '/',
        component: Home,
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

    // If user is logged in, homepage redirects to dashboard
    if (to.path === "/" && userStore.isAuthenticated) {
        return next("/dashboard");
    }

    if (!to.meta?.requiresAuth) return next();

    if (!userStore.isAuthenticated) return next("/");

    // Role-based routing can be enabled here if needed:
    // if (to.meta.role && !userStore.hasRole(to.meta.role)) return next("/forbidden");

    return next();
});

export default router