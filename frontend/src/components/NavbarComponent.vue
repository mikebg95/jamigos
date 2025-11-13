<script setup>
import AuthButtons from "@/components/AuthButtonsComponent.vue";
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
      <router-link to="/" class="navbar-logo" aria-label="TaskFlow home">
        <div class="logo-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="24" height="24" rx="6" fill="url(#gradient)" />
            <path d="M10 16L14 20L22 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="gradient" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stop-color="#667eea"/>
                <stop offset="1" stop-color="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span class="logo-text">TaskFlow</span>
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

      <!-- Auth Buttons -->
      <AuthButtons class="navbar-auth" />
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
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: $z-sticky;
  padding: 0.75rem 0;

  @media (max-width: $breakpoint-md) {
    padding: 0.5rem 0;
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
    :deep(svg) {
      width: 28px;
      height: 28px;
    }
  }
}

.logo-text {
  font-size: $font-2xl;
  font-weight: $font-bold;
  background: linear-gradient(135deg, $color-primary-start 0%, $color-primary-mid 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;

  @media (max-width: $breakpoint-md) {
    font-size: $font-xl;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-lg;
  }
}

/* Navigation Links */
.navbar-links {
  display: flex;
  gap: $spacing-sm;
  margin-left: $spacing-lg;

  @media (max-width: $breakpoint-md) {
    display: none;
  }
}

.nav-link {
  color: $text-secondary;
  text-decoration: none;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-md;
  font-weight: $font-medium;
  font-size: $font-base;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    color: $text-primary;
    background: $surface-overlay-light;
  }

  &.router-link-active,
  &.router-link-exact-active {
    color: $text-primary;
    background: rgba($color-primary-start, 0.15);

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 2px;
      background: linear-gradient(90deg, $color-primary-start 0%, $color-primary-mid 100%);
      border-radius: $radius-xs;
    }
  }
}

/* Auth Buttons */
.navbar-auth {
  margin-left: auto;
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
    background: rgba(10, 10, 15, 0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid $border-light;
    padding: $spacing-sm 0 calc(#{$spacing-sm} + env(safe-area-inset-bottom));
    z-index: $z-sticky;
    justify-content: space-around;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  }
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  color: $text-faint;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 60px;
  border-radius: $radius-lg;

  :deep(svg) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:active {
    transform: scale(0.95);
  }

  &.router-link-active,
  &.router-link-exact-active {
    color: $text-primary;

    :deep(svg) {
      filter: drop-shadow(0 0 8px rgba($color-primary-start, 0.6));
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, $color-primary-start 0%, $color-primary-mid 100%);
      border-radius: 0 0 $radius-xs $radius-xs;
    }

    .bottom-nav-label {
      font-weight: $font-semibold;
    }
  }
}

.bottom-nav-label {
  font-size: $font-xs;
  font-weight: $font-medium;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
