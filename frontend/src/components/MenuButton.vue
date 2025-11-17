<script setup>
import { Menu, X } from 'lucide-vue-next'
import { UI } from '@/config/constants'
import { useMenu } from '@/composables/useMenu.js'

const { isMenuOpen, toggleMenu } = useMenu()
</script>

<template>
  <button
    @click="toggleMenu"
    class="menu-button"
    :class="{ 'active': isMenuOpen }"
    :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
    :aria-expanded="isMenuOpen"
  >
    <X v-if="isMenuOpen" :size="20" :stroke-width="UI.ICON_STROKE_WIDTH" />
    <Menu v-else :size="20" :stroke-width="UI.ICON_STROKE_WIDTH" />
  </button>
</template>

<style scoped lang="scss">
.menu-button {
  // Reset
  appearance: none;
  background: none;
  border: none;
  padding: 0;

  // Layout
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  // Visual
  color: var(--ds-color-text-secondary);
  background: var(--ds-color-surface-subtle);
  border-radius: var(--ds-radius-lg);
  cursor: pointer;

  // Transitions
  transition: all var(--ds-duration-normal) var(--ds-ease-emphasized);

  &:hover {
    color: var(--ds-color-text-primary);
    background: var(--ds-color-surface-hover);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--ds-color-primary);
    outline-offset: 2px;
  }

  // Active state when menu is open
  &.active {
    color: var(--ds-color-primary);
    background: rgba(249, 165, 72, 0.15);

    svg {
      transform: scale(1.1);
    }
  }

  svg {
    transition: transform var(--ds-duration-normal) var(--ds-ease-emphasized);
  }

  &:hover svg {
    transform: scale(1.1);
  }
}
</style>
