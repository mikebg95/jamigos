<script setup>
import { useRouter } from 'vue-router';
import authFacade from "@/auth/authFacade.js";
import { useUserStore } from "@/store/user.js";
import { useUiStore } from "@/store/ui.js";
import { UI } from '@/config/constants';
import { getTheme } from '@/utils/theme.js';
import { UserCircle } from 'lucide-vue-next';

const router = useRouter();
const userStore = useUserStore();
const ui = useUiStore();
const emit = defineEmits(['nav-click']);

const login = async () => {
  ui.startLoading();
  const theme = getTheme();
  // Store theme in sessionStorage so it persists across redirect
  sessionStorage.setItem('pending-auth-theme', theme);
  // Add theme to redirect URI as query parameter
  const redirectPath = `${window.location.pathname}?theme=${theme}`;

  try {
    // Web: keycloak.login() redirects immediately (returns void, page navigates away)
    // Mobile: MobileAuthProvider.login() returns Promise with tokens
    const result = await authFacade.login(redirectPath);

    // If we reach here, we're on mobile (web would have redirected)
    if (result) {
      console.log('[AuthButtons] Mobile login successful, updating state...');

      // Update user store with authenticated state
      const authUser = authFacade.getCurrentUser();
      if (authUser) {
        userStore.setUser(authUser.authenticated, authUser.roles, authUser.tokenParsed);
      }

      // Navigate to dashboard or home based on auth state
      if (userStore.isAuthenticated) {
        console.log('[AuthButtons] Navigating to dashboard...');
        await router.push('/dashboard');
      }
    }
  } catch (error) {
    console.error('[AuthButtons] Login failed:', error);
    alert(`Login failed: ${error.message}`);
  } finally {
    // Clear loading spinner (only matters for mobile, web has redirected)
    ui.stopLoading();
  }
}

const signup = async () => {
  ui.startLoading();
  const theme = getTheme();
  // Store theme in sessionStorage so it persists across redirect
  sessionStorage.setItem('pending-auth-theme', theme);
  // Add theme to redirect URI as query parameter
  const redirectPath = `${window.location.pathname}?theme=${theme}`;

  try {
    // Web: keycloak.register() redirects immediately (returns void, page navigates away)
    // Mobile: MobileAuthProvider.register() returns Promise with tokens
    const result = await authFacade.register(redirectPath);

    // If we reach here, we're on mobile (web would have redirected)
    if (result) {
      console.log('[AuthButtons] Mobile signup successful, updating state...');

      // Update user store with authenticated state
      const authUser = authFacade.getCurrentUser();
      if (authUser) {
        userStore.setUser(authUser.authenticated, authUser.roles, authUser.tokenParsed);
      }

      // Navigate to dashboard or home based on auth state
      if (userStore.isAuthenticated) {
        console.log('[AuthButtons] Navigating to dashboard...');
        await router.push('/dashboard');
      }
    }
  } catch (error) {
    console.error('[AuthButtons] Signup failed:', error);
    alert(`Signup failed: ${error.message}`);
  } finally {
    // Clear loading spinner (only matters for mobile, web has redirected)
    ui.stopLoading();
  }
}
</script>

<template>
  <div class="auth-buttons">
    <router-link
      to="/profile"
      v-if="userStore.isAuthenticated"
      class="profile-link"
      :aria-label="`View profile for ${userStore.user.username}`"
      @click="emit('nav-click')"
    >
      <UserCircle :size="UI.ICON_SIZE_SM" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
      <span class="username">{{ userStore.user.username }}</span>
    </router-link>
    <button
      v-if="!userStore.isAuthenticated"
      @click="login"
      class="ds-btn ds-btn-secondary"
      aria-label="Log in to your account"
    >
      Log in
    </button>
    <button
      v-if="!userStore.isAuthenticated"
      @click="signup"
      class="ds-btn ds-btn-primary"
      aria-label="Sign up for a new account"
    >
      Sign Up
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/scss/variables' as *;

.auth-buttons {
  display: flex;
  gap: var(--ds-spacing-sm);
  align-items: center;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  color: var(--ds-color-text-primary);
  text-decoration: none;
  padding: var(--ds-spacing-md) var(--ds-spacing-base);
  border-radius: var(--ds-radius-lg);
  font-weight: var(--ds-font-weight-medium);
  transition: all var(--ds-duration-normal) var(--ds-ease-emphasized);
  background: var(--ds-color-surface-subtle);
  border: 1px solid var(--ds-color-border-subtle);

  &:hover {
    background: var(--ds-color-surface-hover);
    border-color: var(--ds-color-primary);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid var(--ds-color-primary);
    outline-offset: 2px;
  }

  svg {
    flex-shrink: 0;
  }

  .username {
    @media (max-width: $breakpoint-lg) {
      display: none;
    }
  }

  // Hide on mobile since it's in the bottom navbar
  @media (max-width: $breakpoint-md) {
    display: none;
  }
}
</style>
