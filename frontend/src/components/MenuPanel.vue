<script setup>
import { ref, onMounted } from 'vue'
import { CheckSquare, Info } from 'lucide-vue-next'
import { UI } from '@/config/constants'
import { useMenu } from '@/composables/useMenu.js'
import { isNativeApp } from '@/utils/platform.js'
import { getTheme, toggleTheme } from '@/utils/theme.js'

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const { closeMenu } = useMenu()

// Show theme toggle only on web (not on native mobile apps)
const showThemeToggle = !isNativeApp()

// Track current theme
const isDarkMode = ref(false)

const handleThemeToggle = () => {
  const newTheme = toggleTheme()
  isDarkMode.value = newTheme === 'dark'
}

const handleNavClick = () => {
  closeMenu()
}

onMounted(() => {
  isDarkMode.value = getTheme() === 'dark'
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop overlay -->
    <Transition name="backdrop-fade">
      <div v-if="isOpen" class="menu-backdrop" @click="closeMenu"></div>
    </Transition>

    <Transition name="menu-slide">
      <div v-if="isOpen" class="menu-panel">
        <nav class="menu-nav" role="navigation" aria-label="Additional navigation">
          <router-link to="/items" class="menu-item" @click="handleNavClick">
            <CheckSquare :size="UI.ICON_SIZE_SM" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
            <span>Items</span>
          </router-link>

          <router-link to="/info" class="menu-item" @click="handleNavClick">
            <Info :size="UI.ICON_SIZE_SM" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
            <span>Information</span>
          </router-link>

          <!-- Theme toggle section (web only) -->
          <template v-if="showThemeToggle">
            <div class="menu-divider" role="separator"></div>
            <div class="menu-item theme-item">
              <span>Dark mode</span>
              <button
                @click="handleThemeToggle"
                class="toggle-switch"
                :class="{ 'active': isDarkMode }"
                role="switch"
                :aria-checked="isDarkMode"
                :aria-label="`Dark mode ${isDarkMode ? 'on' : 'off'}`"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </template>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/scss/variables' as *;

.menu-panel {
  position: fixed;
  top: 70px; // Below navbar
  right: 2rem; // Align right edge with hamburger button
  width: 200px;
  background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-xl);
  box-shadow: var(--ds-shadow-elevated);
  z-index: 1001; // Above backdrop (1000)
  overflow: hidden;

  // On wide screens, account for centered container (1400px + 64px padding)
  @media (min-width: 1464px) {
    right: calc((100vw - #{$container-max-width}) / 2 + 2rem);
  }

  @media (max-width: $breakpoint-md) {
    right: 1rem; // Align right edge with hamburger on mobile
    top: 60px;
  }
}

.menu-nav {
  display: flex;
  flex-direction: column;
  padding: var(--ds-spacing-xs);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  padding: var(--ds-spacing-sm) var(--ds-spacing-base);
  color: var(--ds-color-text-secondary);
  text-decoration: none;
  border-radius: var(--ds-radius-lg);
  font-weight: var(--ds-font-weight-medium);
  font-size: var(--ds-font-size-base);
  transition: all var(--ds-duration-fast) var(--ds-ease-standard);

  &:hover {
    color: var(--ds-color-text-primary);
    background: var(--ds-color-surface-hover);
  }

  &:active {
    transform: scale(0.98);
  }

  &.router-link-active,
  &.router-link-exact-active {
    color: var(--ds-color-primary);
    background: rgba(249, 165, 72, 0.15);
  }

  svg {
    flex-shrink: 0;
  }
}

.menu-divider {
  height: 1px;
  background: var(--ds-color-divider);
  margin: var(--ds-spacing-xs) var(--ds-spacing-base);
}

.theme-item {
  justify-content: space-between;
  color: var(--ds-color-text-primary);
  cursor: default;

  &:hover {
    background: transparent;
  }

  &:active {
    transform: none;
  }
}

.toggle-switch {
  // Reset
  appearance: none;
  border: none;
  padding: 0;

  // Layout
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;

  // Visual
  background: var(--ds-color-border);
  border-radius: 12px;
  cursor: pointer;

  // Transitions
  transition: background-color var(--ds-duration-normal) var(--ds-ease-standard);

  &:focus-visible {
    outline: 2px solid var(--ds-color-primary);
    outline-offset: 2px;
  }

  &.active {
    background: var(--ds-color-primary);
  }
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform var(--ds-duration-normal) var(--ds-ease-standard);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  .toggle-switch.active & {
    transform: translateX(20px);
  }
}

.menu-backdrop {
  position: fixed;
  top: var(--navbar-top-offset); // Start below top navbar (adapts to safe-area-inset-top)
  left: 0;
  right: 0;
  bottom: var(--navbar-bottom-offset); // Stop above bottom navbar on mobile, 0 on desktop
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 1000;
  cursor: pointer;
}

// Slide animation
.menu-slide-enter-active {
  animation: slide-down 0.3s var(--ds-ease-emphasized);
}

.menu-slide-leave-active {
  animation: slide-up 0.2s var(--ds-ease-emphasized);
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

// Backdrop fade animation
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity var(--ds-duration-normal) var(--ds-ease-standard);
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}
</style>
