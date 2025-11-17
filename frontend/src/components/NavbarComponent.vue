<script setup>
import AuthButtons from "@/components/AuthButtonsComponent.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";
import SearchButton from "@/components/SearchButton.vue";
import NotificationsButton from "@/components/NotificationsButton.vue";
import JamigosLogo from "@/components/JamigosLogo.vue";
import { LayoutGrid, UserCircle, MessageCircle, Compass, X } from 'lucide-vue-next';
import { useUserStore } from "@/store/user.js";
import { useNotifications } from '@/composables/useNotifications.js';
import { useSearch } from '@/composables/useSearch.js';
import { UI } from '@/config/constants';

const store = useUserStore();
const { closeNotifications } = useNotifications();
const { isSearchOpen, searchQuery, closeSearch } = useSearch();

// Close notifications when any navbar item is clicked
const handleNavClick = () => {
  closeNotifications();
};
</script>

<template>
  <!-- Skip to main content link for accessibility -->
  <a href="#main-content" class="skip-link sr-only sr-only-focusable">
    Skip to main content
  </a>

  <!-- Top Navbar -->
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="navbar-container" :class="{ 'search-active': isSearchOpen }">
      <!-- Logo -->
      <router-link to="/" class="navbar-logo" aria-label="Jamigos home" @click="handleNavClick">
        <div class="logo-icon" aria-hidden="true">
          <JamigosLogo variant="minimal" height="32" />
        </div>
        <span class="logo-text">JAMIGOS</span>
      </router-link>

      <!-- Desktop Navigation Links -->
      <nav class="navbar-links hide-on-mobile-search" v-if="store.isAuthenticated" aria-label="Primary">
        <router-link to="/dashboard" class="nav-link" aria-label="Go to dashboard" @click="handleNavClick">
          Dashboard
        </router-link>
        <router-link to="/info" class="nav-link" aria-label="View information" @click="handleNavClick">
          Info
        </router-link>
        <router-link to="/todo" class="nav-link" aria-label="Manage your tasks" @click="handleNavClick">
          To-do
        </router-link>
      </nav>

      <!-- Search Bar - appears when search is active -->
      <Transition name="search-appear">
        <div v-if="isSearchOpen" class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="search-input"
            autofocus
          />
          <button @click="closeSearch" class="search-close-button" aria-label="Close search">
            <X :size="20" :stroke-width="UI.ICON_STROKE_WIDTH" />
          </button>
        </div>
      </Transition>

      <!-- Theme Toggle & Auth Buttons -->
      <div class="navbar-actions">
        <Transition name="search-button-appear">
          <div v-if="store.isAuthenticated && !isSearchOpen" @click="handleNavClick">
            <SearchButton />
          </div>
        </Transition>
        <ThemeToggle />
        <NotificationsButton v-if="store.isAuthenticated" class="hide-on-mobile-search" />
        <AuthButtons @nav-click="handleNavClick" class="hide-on-mobile-search" />
      </div>
    </div>
  </nav>

  <!-- Mobile Bottom Navigation -->
  <nav class="bottom-nav" v-if="store.isAuthenticated" role="navigation" aria-label="Mobile navigation">
    <router-link to="/dashboard" class="bottom-nav-item" aria-label="Go to dashboard" @click="handleNavClick">
      <LayoutGrid :size="UI.ICON_SIZE_MD" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
      <span class="bottom-nav-label">Dashboard</span>
    </router-link>

<!--    <router-link to="/todo" class="bottom-nav-item" aria-label="Manage your tasks" @click="handleNavClick">-->
<!--      <CheckSquare :size="UI.ICON_SIZE_MD" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />-->
<!--      <span class="bottom-nav-label">Tasks</span>-->
<!--    </router-link>-->

    <router-link to="/explore" class="bottom-nav-item" aria-label="Explore" @click="handleNavClick">
      <Compass :size="UI.ICON_SIZE_MD" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
      <span class="bottom-nav-label">Explore</span>
    </router-link>

    <router-link to="/messages" class="bottom-nav-item" aria-label="View messages" @click="handleNavClick">
      <MessageCircle :size="UI.ICON_SIZE_MD" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
      <span class="bottom-nav-label">Messages</span>
    </router-link>

<!--    <router-link to="/info" class="bottom-nav-item" aria-label="View information" @click="handleNavClick">-->
<!--      <Info :size="UI.ICON_SIZE_MD" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />-->
<!--      <span class="bottom-nav-label">Info</span>-->
<!--    </router-link>-->

    <router-link to="/profile" class="bottom-nav-item" aria-label="View your profile" @click="handleNavClick">
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

  @media (max-width: 480px) {
    display: none;
  }

  // Hide text when search is active only on very small screens
  .navbar-container.search-active & {
    @media (max-width: 480px) {
      display: none;
    }
  }
}

/* White text in dark mode */
:root[data-theme='dark'] .logo-text {
  color: #ffffff;
}

/* Search bar */
.search-bar {
  flex: 1;
  margin: 0 var(--ds-spacing-md);
  max-width: 600px;
  position: relative;

  @media (max-width: $breakpoint-md) {
    max-width: none;
    margin: 0 var(--ds-spacing-sm);
  }
}

.search-input {
  width: 100%;
  padding: var(--ds-spacing-sm) var(--ds-spacing-base);
  border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-lg);
  background: var(--ds-color-surface-subtle);
  color: var(--ds-color-text-primary);
  font-size: var(--ds-font-size-base);
  transition: all var(--ds-duration-normal) var(--ds-ease-emphasized);

  padding-right: 40px; // Make room for close button

  &::placeholder {
    color: var(--ds-color-text-tertiary);
  }

  &:focus {
    outline: none;
    border-color: var(--ds-color-primary);
    background: var(--ds-color-surface);
    box-shadow: 0 0 0 3px rgba(249, 165, 72, 0.1);
  }
}

.search-close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--ds-color-text-secondary);
  cursor: pointer;
  padding: var(--ds-spacing-xs);
  border-radius: var(--ds-radius-md);
  transition: all var(--ds-duration-fast) var(--ds-ease-standard);

  &:hover {
    color: var(--ds-color-text-primary);
    background: var(--ds-color-surface-hover);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &:focus,
  &:focus-visible {
    outline: none;
  }
}

// Make close button disappear instantly when search bar is closing
.search-appear-leave-active .search-close-button {
  opacity: 0;
  transition: none;
}

/* Search bar animation */
.search-appear-enter-active {
  animation: search-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.search-appear-leave-active {
  animation: search-pop-out 0.25s cubic-bezier(0.32, 0, 0.67, 0);
}

@keyframes search-pop-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateX(-15px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
}

@keyframes search-pop-out {
  from {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateX(-10px);
  }
}

/* Search button animation (when search bar closes) */
.search-button-appear-enter-active {
  animation: button-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.search-button-appear-leave-active {
  animation: button-pop-out 0.2s cubic-bezier(0.32, 0, 0.67, 0);
}

@keyframes button-pop-in {
  from {
    opacity: 0;
    transform: scale(0.8) rotate(-10deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes button-pop-out {
  from {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  to {
    opacity: 0;
    transform: scale(0.9) rotate(5deg);
  }
}

/* Hide elements when search is active on mobile and medium screens */
.hide-on-mobile-search {
  transition: opacity 0.3s var(--ds-ease-emphasized),
              transform 0.3s var(--ds-ease-emphasized);

  @media (max-width: $breakpoint-lg) {
    .navbar-container.search-active & {
      opacity: 0;
      transform: scale(0.95) translateX(10px);
      pointer-events: none;
      position: absolute;
      right: 0;
    }
  }
}

/* Navigation Links */
.navbar-links {
  display: flex;
  gap: var(--ds-spacing-sm);
  margin-left: var(--ds-spacing-lg);
  transition: opacity 0.3s var(--ds-ease-emphasized),
              transform 0.3s var(--ds-ease-emphasized);

  @media (max-width: $breakpoint-md) {
    display: none;
  }

  // Animate out when search is active on medium screens
  @media (min-width: $breakpoint-md) and (max-width: $breakpoint-lg) {
    .navbar-container.search-active & {
      opacity: 0;
      transform: scale(0.95) translateX(-10px);
      pointer-events: none;
      position: absolute;
      left: 100px;
    }
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
