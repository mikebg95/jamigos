<script setup>
import { Bell } from 'lucide-vue-next';
import { UI } from '@/config/constants';
import NotificationsPanel from './NotificationsPanel.vue';
import { useNotifications } from '@/composables/useNotifications.js';

const { isNotificationsOpen, toggleNotifications, closeNotifications } = useNotifications();
</script>

<template>
  <div>
    <button
      @click="toggleNotifications"
      class="icon-button"
      :class="{ 'active': isNotificationsOpen }"
      aria-label="Notifications"
      :aria-expanded="isNotificationsOpen"
      title="Notifications"
    >
      <Bell :size="20" :stroke-width="UI.ICON_STROKE_WIDTH" />
    </button>

    <NotificationsPanel :isOpen="isNotificationsOpen" @close="closeNotifications" />
  </div>
</template>

<style scoped lang="scss">
.icon-button {
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

  // Active state when panel is open
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
