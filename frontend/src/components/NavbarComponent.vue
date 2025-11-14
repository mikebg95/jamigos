<script setup>
import AuthButtons from "@/components/AuthButtonsComponent.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";
import JamigosLogo from "@/components/JamigosLogo.vue";
import { useUserStore } from "@/store/user.js";
import { UI } from '@/config/constants';

const store = useUserStore();
</script>

<template>
  <!-- Skip to main content link for accessibility -->
  <a href="#main-content" class="skip-link sr-only sr-only-focusable">
    Skip to main content
  </a>

  <!-- Top Navbar -->
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="navbar-container">
      <!-- Logo -->
      <router-link to="/" class="navbar-logo" aria-label="Jamigos home">
        <div class="logo-icon" aria-hidden="true">
          <JamigosLogo variant="minimal" height="32" />
        </div>
        <span class="logo-text">JAMIGOS</span>
      </router-link>

      <!-- Desktop Navigation Links -->
      <nav class="navbar-links" v-if="store.isAuthenticated" aria-label="Primary">
        <router-link to="/dashboard" class="nav-link" aria-label="Go to dashboard">
          Dashboard
        </router-link>
        <router-link to="/info" class="nav-link" aria-label="View information">
          Info
        </router-link>
        <router-link to="/todo" class="nav-link" aria-label="Manage your tasks">
          To-do
        </router-link>
      </nav>

      <!-- Theme Toggle & Auth Buttons -->
      <div class="navbar-actions">
        <ThemeToggle />
        <AuthButtons />
      </div>
    </div>
  </nav>

  <!-- Mobile Bottom Navigation -->
  <nav class="bottom-nav" v-if="store.isAuthenticated" role="navigation" aria-label="Mobile navigation">
    <router-link to="/dashboard" class="bottom-nav-item" aria-label="Go to dashboard">
      <LayoutGrid :size="UI.ICON_SIZE_MD" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
      <span class="bottom-nav-label">Dashboard</span>
    </router-link>

    <router-link to="/todo" class="bottom-nav-item" aria-label="Manage your tasks">
      <CheckSquare :size="UI.ICON_SIZE_MD" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
      <span class="bottom-nav-label">Tasks</span>
    </router-link>

    <router-link to="/info" class="bottom-nav-item" aria-label="View information">
      <Info :size="UI.ICON_SIZE_MD" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
      <span class="bottom-nav-label">Info</span>
    </router-link>

    <router-link to="/profile" class="bottom-nav-item" aria-label="View your profile">
      <UserCircle :size="UI.ICON_SIZE_MD" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
      <span class="bottom-nav-label">Profile</span>
    </router-link>
  </nav>
</template>

<style scoped lang="scss">
@use '@/scss/variables' as *;

.navbar {
  position: sticky;
  top: 0;
  background: var(--ds-color-surface);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--ds-color-divider);
  box-shadow: var(--ds-shadow-soft);
  z-index: $z-sticky;
  padding: var(--ds-spacing-md) 0;

  @media (max-width: $breakpoint-md) {
    padding: var(--ds-spacing-sm) 0;
  }
}

.navbar-container {
  max-width: $container-max-width;
  margin: 0 auto;
  padding: 0 $container-padding;
  display: flex;
  align-items: center;
  gap: 0;

  @media (max-width: $breakpoint-md) {
    padding: 0 $container-padding-mobile;
  }
}

/* Logo */
.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);

    .logo-icon {
      transform: rotate(5deg);
    }
  }
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: $breakpoint-sm) {
    :deep(img) {
      width: 28px;
      height: 28px;
    }
  }
}

.logo-text {
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: var(--ds-font-size-2xl);
  font-weight: 500;
  color: #000000;
  letter-spacing: 1.5px;
  text-transform: uppercase;

  @media (max-width: $breakpoint-md) {
    font-size: var(--ds-font-size-xl);
  }

  @media (max-width: $breakpoint-sm) {
    font-size: var(--ds-font-size-lg);
  }
}

/* White text in dark mode */
:root[data-theme='dark'] .logo-text {
  color: #ffffff;
}

/* Navigation Links */
.navbar-links {
  display: flex;
  gap: var(--ds-spacing-sm);
  margin-left: var(--ds-spacing-lg);

  @media (max-width: $breakpoint-md) {
    display: none;
  }
}

.nav-link {
  color: var(--ds-color-text-secondary);
  text-decoration: none;
  padding: var(--ds-spacing-sm) var(--ds-spacing-base);
  border-radius: var(--ds-radius-lg);
  font-weight: var(--ds-font-weight-medium);
  font-size: var(--ds-font-size-base);
  transition: all var(--ds-duration-normal) var(--ds-ease-emphasized);
  position: relative;

  &:hover {
    color: var(--ds-color-text-primary);
    background: var(--ds-color-surface-subtle);
  }

  &.router-link-active,
  &.router-link-exact-active {
    color: var(--ds-color-text-primary);
    background: rgba(249, 165, 72, 0.15);

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 2px;
      background: linear-gradient(90deg, var(--ds-color-primary) 0%, var(--ds-color-secondary) 100%);
      border-radius: var(--ds-radius-sm);
    }
  }
}

/* Actions (Theme Toggle + Auth Buttons) */
.navbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
}

/* Mobile Bottom Navigation */
.bottom-nav {
  display: none;

  @media (max-width: $breakpoint-md) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--ds-color-surface);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--ds-color-divider);
    padding: var(--ds-spacing-sm) 0 calc(#{var(--ds-spacing-sm)} + env(safe-area-inset-bottom));
    z-index: $z-sticky;
    justify-content: space-around;
    box-shadow: var(--ds-shadow-medium);
  }
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ds-spacing-xs);
  padding: var(--ds-spacing-sm) var(--ds-spacing-md);
  color: var(--ds-color-text-tertiary);
  text-decoration: none;
  transition: all var(--ds-duration-normal) var(--ds-ease-emphasized);
  position: relative;
  min-width: 60px;
  border-radius: var(--ds-radius-lg);

  :deep(svg) {
    transition: all var(--ds-duration-normal) var(--ds-ease-emphasized);
  }

  &:active {
    transform: scale(0.95);
  }

  &.router-link-active,
  &.router-link-exact-active {
    color: var(--ds-color-text-primary);

    :deep(svg) {
      filter: drop-shadow(0 0 8px var(--ds-color-primary));
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, var(--ds-color-primary) 0%, var(--ds-color-secondary) 100%);
      border-radius: 0 0 var(--ds-radius-sm) var(--ds-radius-sm);
    }

    .bottom-nav-label {
      font-weight: var(--ds-font-weight-semibold);
    }
  }
}

.bottom-nav-label {
  font-size: var(--ds-font-size-xs);
  font-weight: var(--ds-font-weight-medium);
  transition: all var(--ds-duration-normal) var(--ds-ease-emphasized);
}
</style>
