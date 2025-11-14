<script setup>
import keycloak from "../auth/keycloak";
import { useUiStore } from "@/store/ui.js";
import { UI } from '@/config/constants';
import { getTheme } from '@/utils/theme.js';

const ui = useUiStore();

const login = () => {
  ui.startLoading();
  const theme = getTheme();
  // Store theme in sessionStorage so it persists across redirect
  sessionStorage.setItem('pending-auth-theme', theme);
  // Add theme to redirect URI as query parameter
  const redirectUri = `${window.location.origin}${window.location.pathname}?theme=${theme}`;
  keycloak.login({ redirectUri });
}
const logout = () => {
  ui.startLoading();
  keycloak.logout({ redirectUri: window.location.origin });
}
const signup = () => {
  ui.startLoading();
  const theme = getTheme();
  // Store theme in sessionStorage so it persists across redirect
  sessionStorage.setItem('pending-auth-theme', theme);
  // Add theme to redirect URI as query parameter
  const redirectUri = `${window.location.origin}${window.location.pathname}?theme=${theme}`;
  keycloak.register({ redirectUri });
}
</script>

<template>
  <div class="auth-buttons">
    <router-link
      to="/profile"
      v-if="keycloak.authenticated"
      class="profile-link"
      :aria-label="`View profile for ${keycloak.tokenParsed?.preferred_username}`"
    >
      <UserCircle :size="UI.ICON_SIZE_SM" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
      <span class="username">{{ keycloak.tokenParsed?.preferred_username }}</span>
    </router-link>
    <button
      v-if="!keycloak.authenticated"
      @click="login"
      class="btn-secondary"
      aria-label="Log in to your account"
    >
      Log in
    </button>
    <button
      v-if="!keycloak.authenticated"
      @click="signup"
      class="btn-primary"
      aria-label="Sign up for a new account"
    >
      Sign Up
    </button>
    <button
      v-else
      @click="logout"
      class="btn-primary"
      aria-label="Log out of your account"
    >
      Log out
    </button>
  </div>
</template>

<style scoped lang="scss">
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
    @media (max-width: 480px) {
      display: none;
    }
  }
}

.btn-primary,
.btn-secondary {
  padding: var(--ds-spacing-md) var(--ds-spacing-xl);
  border: none;
  border-radius: var(--ds-radius-lg);
  font-size: var(--ds-font-size-base);
  font-weight: var(--ds-font-weight-semibold);
  cursor: pointer;
  transition: all var(--ds-duration-normal) var(--ds-ease-emphasized);
  position: relative;
  overflow: hidden;
  white-space: nowrap;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left var(--ds-duration-slower);
  }

  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid var(--ds-color-primary);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    padding: var(--ds-spacing-sm) var(--ds-spacing-base);
    font-size: var(--ds-font-size-sm);
  }
}

.btn-primary {
  background: var(--ds-color-primary);
  color: var(--ds-color-inverse-text);
  box-shadow: var(--ds-shadow-soft);

  &:hover {
    background: var(--ds-color-primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--ds-shadow-glow-primary);
  }
}

.btn-secondary {
  background: var(--ds-color-secondary);
  color: var(--ds-color-inverse-text);
  box-shadow: var(--ds-shadow-soft);

  &:hover {
    background: var(--ds-color-secondary-dark);
    transform: translateY(-2px);
    box-shadow: var(--ds-shadow-glow-secondary);
  }
}
</style>