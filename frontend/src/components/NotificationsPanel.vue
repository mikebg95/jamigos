<script setup>
import { X } from 'lucide-vue-next';
import { UI } from '@/config/constants';

// Dummy notifications data - will be replaced with real data later
const notifications = [
  {
    id: 1,
    title: 'New message from John',
    message: 'Hey, are you available for a quick call?',
    time: '5 min ago',
    read: false
  },
  {
    id: 2,
    title: 'Task completed',
    message: 'Your task "Update profile" has been marked as complete.',
    time: '1 hour ago',
    read: false
  },
  {
    id: 3,
    title: 'Welcome to Jamigos!',
    message: 'Thanks for joining us. Get started by exploring the dashboard.',
    time: '2 hours ago',
    read: true
  },
  {
    id: 4,
    title: 'System update',
    message: 'A new version is available. Please refresh to update.',
    time: '1 day ago',
    read: true
  }
];

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);

const closePanel = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop overlay -->
    <Transition name="backdrop-fade">
      <div v-if="isOpen" class="notifications-backdrop" @click="closePanel"></div>
    </Transition>

    <Transition name="notifications-slide">
      <div v-if="isOpen" class="notifications-panel">
        <div class="notifications-header">
          <h2>Notifications</h2>
          <button @click="closePanel" class="close-button" aria-label="Close notifications">
            <X :size="24" :stroke-width="UI.ICON_STROKE_WIDTH" />
          </button>
        </div>

        <div class="notifications-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
          >
            <div class="notification-content">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ notification.time }}</span>
            </div>
            <div v-if="!notification.read" class="unread-indicator"></div>
          </div>

          <div v-if="notifications.length === 0" class="empty-state">
            <p>No notifications yet</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/scss/variables' as *;

.notifications-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-height: 70vh;
  background: var(--ds-color-surface);
  border-bottom-left-radius: var(--ds-radius-2xl);
  border-bottom-right-radius: var(--ds-radius-2xl);
  box-shadow: var(--ds-shadow-elevated);
  z-index: 1001; // Above backdrop (1000)
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ds-spacing-lg) var(--ds-spacing-xl);
  border-bottom: 1px solid var(--ds-color-divider);
  background: var(--ds-color-surface);

  h2 {
    margin: 0;
    font-size: var(--ds-font-size-xl);
    font-weight: var(--ds-font-weight-bold);
    color: var(--ds-color-text-primary);
  }
}

.close-button {
  appearance: none;
  background: none;
  border: none;
  padding: var(--ds-spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ds-color-text-secondary);
  cursor: pointer;
  border-radius: var(--ds-radius-lg);
  transition: all var(--ds-duration-normal) var(--ds-ease-emphasized);

  &:hover {
    color: var(--ds-color-text-primary);
    background: var(--ds-color-surface-hover);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--ds-color-primary);
    outline-offset: 2px;
  }
}

.notifications-list {
  overflow-y: auto;
  flex: 1;
  padding: var(--ds-spacing-base);
}

.notification-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-base);
  padding: var(--ds-spacing-base);
  margin-bottom: var(--ds-spacing-sm);
  border-radius: var(--ds-radius-lg);
  background: var(--ds-color-surface-subtle);
  transition: background-color 0s, transform var(--ds-duration-fast) var(--ds-ease-standard);

  &.unread {
    background: rgba(249, 165, 72, 0.08);
    border-left: 3px solid var(--ds-color-primary);
  }

  &:hover {
    background: var(--ds-color-surface-hover);
    transform: translateX(4px);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.notification-content {
  flex: 1;
}

.notification-title {
  margin: 0 0 var(--ds-spacing-xs);
  font-size: var(--ds-font-size-base);
  font-weight: var(--ds-font-weight-semibold);
  color: var(--ds-color-text-primary);
}

.notification-message {
  margin: 0 0 var(--ds-spacing-xs);
  font-size: var(--ds-font-size-sm);
  color: var(--ds-color-text-secondary);
  line-height: 1.4;
}

.notification-time {
  font-size: var(--ds-font-size-xs);
  color: var(--ds-color-text-tertiary);
}

.unread-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ds-color-primary);
  flex-shrink: 0;
  margin-top: var(--ds-spacing-xs);
}

.empty-state {
  text-align: center;
  padding: var(--ds-spacing-2xl);
  color: var(--ds-color-text-tertiary);

  p {
    margin: 0;
    font-size: var(--ds-font-size-base);
  }
}

.notifications-backdrop {
  position: fixed;
  top: var(--navbar-top-offset); // Start below top navbar (adapts to safe-area-inset-top)
  left: 0;
  right: 0;
  bottom: var(--navbar-bottom-offset); // Stop above bottom navbar on mobile, 0 on desktop
  background: rgba(0, 0, 0, 0.2); // Semi-transparent dark overlay
  backdrop-filter: blur(3px); // Very subtle blur
  -webkit-backdrop-filter: blur(3px); // Safari support
  z-index: 1000;
  cursor: pointer;
}

// Slide down/up animation
.notifications-slide-enter-active {
  animation: slide-down var(--ds-duration-normal) var(--ds-ease-emphasized);
}

.notifications-slide-leave-active {
  animation: slide-up var(--ds-duration-normal) var(--ds-ease-emphasized);
}

@keyframes slide-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
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

// Mobile styling - add safe area padding to prevent status bar overlap
@media (max-width: $breakpoint-md) {
  .notifications-panel {
    // Add safe-area-inset-top to prevent iOS status bar overlap (same as navbar)
    padding-top: calc(var(--ds-spacing-sm) + constant(safe-area-inset-top)); /* iOS 11.0-11.2 */
    padding-top: calc(var(--ds-spacing-sm) + env(safe-area-inset-top)); /* iOS 11.2+ and Android */
  }
}

// Desktop styling - larger centered panel
@media (min-width: $breakpoint-md) {
  .notifications-panel {
    position: fixed;
    top: 100px; // Position below navbar
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: 600px;
    max-width: 90vw;
    max-height: 75vh;
    border-radius: var(--ds-radius-2xl);
    box-shadow: var(--ds-shadow-elevated);

    // Remove arrow on desktop centered version
    &::before {
      display: none;
    }
  }

  .notifications-header {
    border-top-left-radius: var(--ds-radius-2xl);
    border-top-right-radius: var(--ds-radius-2xl);
    padding: var(--ds-spacing-xl) var(--ds-spacing-2xl);

    h2 {
      font-size: var(--ds-font-size-2xl);
    }
  }

  .notifications-list {
    padding: var(--ds-spacing-lg);
  }

  .notification-item {
    padding: var(--ds-spacing-lg);
    margin-bottom: var(--ds-spacing-base);
  }

  // Different animation for desktop - slide from top center
  .notifications-slide-enter-active {
    animation: slide-down-desktop var(--ds-duration-normal) var(--ds-ease-emphasized);
  }

  .notifications-slide-leave-active {
    animation: slide-up-desktop var(--ds-duration-normal) var(--ds-ease-emphasized);
  }

  @keyframes slide-down-desktop {
    from {
      transform: translate(-50%, -30px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }

  @keyframes slide-up-desktop {
    from {
      transform: translate(-50%, 0);
      opacity: 1;
    }
    to {
      transform: translate(-50%, -30px);
      opacity: 0;
    }
  }
}
</style>
