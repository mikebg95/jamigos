<script setup>
import { CheckSquare, Info } from 'lucide-vue-next'
import { UI } from '@/config/constants'
import { useMenu } from '@/composables/useMenu.js'

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const { closeMenu } = useMenu()

const handleNavClick = () => {
  closeMenu()
}
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
          <router-link to="/todo" class="menu-item" @click="handleNavClick">
            <CheckSquare :size="UI.ICON_SIZE_SM" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
            <span>Tasks</span>
          </router-link>

          <router-link to="/info" class="menu-item" @click="handleNavClick">
            <Info :size="UI.ICON_SIZE_SM" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
            <span>Information</span>
          </router-link>
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
  right: var(--ds-spacing-base);
  width: 200px;
  background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-xl);
  box-shadow: var(--ds-shadow-elevated);
  z-index: 1001; // Above backdrop (1000)
  overflow: hidden;

  @media (max-width: $breakpoint-md) {
    right: var(--ds-spacing-sm);
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

.menu-backdrop {
  position: fixed;
  top: 80px; // Start below top navbar
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 1000;
  cursor: pointer;

  @media (max-width: $breakpoint-md) {
    bottom: 72px; // Stop above bottom navbar on mobile
  }
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
