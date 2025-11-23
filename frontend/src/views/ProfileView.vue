<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from "../store/user.js";
import { useUiStore } from "../store/ui.js";
import authFacade from "@/auth/authFacade.js";
import { LogOut } from "lucide-vue-next";
import { UI } from '@/config/constants';
import { getTheme } from '@/utils/theme.js';
import { Capacitor } from '@capacitor/core';

const router = useRouter();
const userStore = useUserStore();
const uiStore = useUiStore();
const isNative = Capacitor.isNativePlatform();

const logout = async () => {
  const theme = getTheme();
  const redirectPath = `/?theme=${theme}`;

  try {
    if (isNative) {
      // MOBILE: Show splash, logout, navigate to /mobile-auth
      console.log('[ProfileView] Mobile logout - showing splash...');
      uiStore.startLogoutSplash();

      await authFacade.logout(redirectPath);
      console.log('[ProfileView] Mobile logout completed, clearing state...');

      // Clear user store
      userStore.setUser(false, [], {});

      // Navigate to mobile auth entry screen
      console.log('[ProfileView] Navigating to /mobile-auth...');
      await router.push('/mobile-auth');
      // Splash auto-hides via handleLogoutSplashComplete in App.vue
    } else {
      // WEB: Traditional flow - unchanged
      console.log('[ProfileView] Web logout - using traditional flow...');
      uiStore.startLoading();

      // Web: keycloak.logout() redirects immediately (page navigates away)
      await authFacade.logout(redirectPath);
      // Should never reach here on web (page redirects)
    }
  } catch (error) {
    console.error('[ProfileView] Logout failed:', error);
    alert(`Logout failed: ${error.message}`);

    // Clean up on error
    if (isNative) {
      uiStore.stopLogoutSplash();
    } else {
      uiStore.stopLoading();
    }
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
