<script setup>
import { ref } from 'vue';
import { AlertCircle, X } from 'lucide-vue-next';
import { UI } from '@/config/constants';

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  dismissible: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    default: 'error', // error, warning, info
    validator: (value) => ['error', 'warning', 'info'].includes(value),
  },
});

const emit = defineEmits(['dismiss']);

const visible = ref(true);

const dismiss = () => {
  visible.value = false;
  emit('dismiss');
};
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="visible"
      :class="['error-alert', `error-alert--${type}`]"
      role="alert"
      aria-live="assertive"
    >
      <div class="error-alert__icon">
        <AlertCircle :size="UI.ICON_SIZE_SM" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
      </div>

      <div class="error-alert__content">
        <p class="error-alert__message">{{ message }}</p>
      </div>

      <button
        v-if="dismissible"
        @click="dismiss"
        class="error-alert__dismiss"
        aria-label="Dismiss error message"
      >
        <X :size="UI.ICON_SIZE_SM" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.error-alert {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-base);
  padding: var(--ds-spacing-base) var(--ds-spacing-lg);
  border-radius: var(--ds-radius-lg);
  background: var(--ds-color-surface);
  border: 2px solid;
  box-shadow: var(--ds-shadow-soft);
  animation: slideDown var(--ds-duration-normal) var(--ds-ease-emphasized);

  &--error {
    background: rgba(217, 83, 79, 0.1);
    border-color: var(--ds-color-error);

    .error-alert__icon {
      color: var(--ds-color-error);
    }
  }

  &--warning {
    background: rgba(255, 191, 77, 0.1);
    border-color: var(--ds-color-warning);

    .error-alert__icon {
      color: var(--ds-color-warning);
    }
  }

  &--info {
    background: rgba(14, 179, 167, 0.1);
    border-color: var(--ds-color-info);

    .error-alert__icon {
      color: var(--ds-color-info);
    }
  }
}

.error-alert__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-alert__content {
  flex: 1;
  min-width: 0; // Allow text to wrap
}

.error-alert__message {
  margin: 0;
  color: var(--ds-color-text-primary);
  font-size: var(--ds-font-size-base);
  line-height: var(--ds-line-height-normal);
}

.error-alert__dismiss {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-xs);
  background: transparent;
  border: none;
  border-radius: var(--ds-radius-md);
  color: var(--ds-color-text-tertiary);
  cursor: pointer;
  transition: all var(--ds-duration-fast) var(--ds-ease-standard);

  &:hover {
    background: var(--ds-color-surface-subtle);
    color: var(--ds-color-text-primary);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--ds-color-primary);
    outline-offset: 2px;
  }
}

// Transition animations
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--ds-duration-normal) var(--ds-ease-emphasized);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
