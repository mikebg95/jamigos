import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        isAuthenticated: false,
        user: {
            roles: [],
            username: "",
            firstName: "",
            lastName: "",
            email: "",
        },
    }),

    actions: {
        setUser(authenticated, roles, tokenParsed) {
            const allowed = ["USER_ROLE", "ADMIN_ROLE"];
            this.isAuthenticated = authenticated;

            this.user = {
                roles: roles.filter(r => allowed.includes(r)),
                username: tokenParsed?.preferred_username || "",
                firstName: tokenParsed?.given_name || "",
                lastName: tokenParsed?.family_name || "",
                email: tokenParsed?.email || "",
            };
        },
        clearUser() {
            this.isAuthenticated = false;
            this.user = {
                roles: [],
                username: "",
                firstName: "",
                lastName: "",
                email: "",
            };
        },
        hasRole(role) {
            return this.user.roles.includes(role);
        },
        hasAnyRole(list) {
            return list.some(r => this.user.roles.includes(r));
        },
        hasAllRoles(list) {
            return list.every(r => this.user.roles.includes(r));
        },
    },
});
