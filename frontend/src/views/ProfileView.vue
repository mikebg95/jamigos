<script setup>
import { useUserStore } from "../store/user.js";
import { useUiStore } from "../store/ui.js";
import keycloak from "../auth/keycloak";
import { useRouter } from 'vue-router';
import { LogOut } from "lucide-vue-next";
import { UI } from '@/config/constants';

const userStore = useUserStore();
const uiStore = useUiStore();
const router = useRouter();

const logout = async () => {
  uiStore.startLoading();

  // Detect if running in Capacitor (mobile)
  const isCapacitor = !!(window.Capacitor && window.Capacitor.getPlatform() !== 'web');

  if (isCapacitor) {
    // Mobile logout: Call Keycloak logout endpoint first, then clear tokens
    console.log('[Logout] Mobile logout - logging out of Keycloak');

    try {
      // Import CapacitorAuthHandler to call logout
      const { CapacitorAuthHandler } = await import('../auth/capacitorAuth.js');

      const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
      const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM;
      const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

      const authHandler = new CapacitorAuthHandler(KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID);

      // Get refresh token before clearing
      const storedTokens = localStorage.getItem('keycloak_tokens');
      const tokens = storedTokens ? JSON.parse(storedTokens) : null;

      if (tokens?.refresh_token) {
        // Log out of Keycloak server
        await authHandler.logout(tokens.refresh_token);
      }
    } catch (error) {
      console.error('[Logout] Keycloak logout failed:', error);
      // Continue with local logout even if server logout fails
    }

    // Clear all auth data
    localStorage.removeItem('keycloak_tokens');
    sessionStorage.clear();
    userStore.clearUser();

    // Force reload to trigger login again
    window.location.replace('/');
  } else {
    // Web logout: Use Keycloak JS adapter
    keycloak.logout({ redirectUri: window.location.origin });
  }
};
</script>

<template>
  <div class="page">
    <div class="container">
      <h1 class="title">User Info</h1>
      <div class="profile-info">
        <p><strong>Username:</strong> {{ userStore.user.username }}</p>
        <p><strong>First name:</strong> {{ userStore.user.firstName }}</p>
        <p><strong>Last name:</strong> {{ userStore.user.lastName }}</p>
        <p><strong>Email:</strong> {{ userStore.user.email }}</p>
        <p><strong>Roles:</strong> {{ userStore.user.roles.join(", ") }}</p>
      </div>

      <div class="profile-actions">
        <button
          @click="logout"
          class="ds-btn ds-btn-error"
          aria-label="Log out of your account"
        >
          <LogOut :size="UI.ICON_SIZE_SM" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-info {
  margin-bottom: var(--ds-spacing-2xl);

  p {
    margin: var(--ds-spacing-base) 0;
    font-size: var(--ds-font-size-base);
    color: var(--ds-color-text-primary);

    strong {
      color: var(--ds-color-text-secondary);
      font-weight: var(--ds-font-weight-semibold);
      min-width: 120px;
      display: inline-block;
    }
  }
}

.profile-actions {
  display: flex;
  gap: var(--ds-spacing-md);
  margin-top: var(--ds-spacing-2xl);
  padding-top: var(--ds-spacing-2xl);
  border-top: 1px solid var(--ds-color-divider);
}
</style>
