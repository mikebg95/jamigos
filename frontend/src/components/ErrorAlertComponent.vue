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
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.error-alert {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md $spacing-lg;
  border-radius: $radius-lg;
  @include glass(0.05);
  border: 1px solid;
  animation: slideDown 0.3s ease-out;

  &--error {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);

    .error-alert__icon {
      color: $color-error;
    }
  }

  &--warning {
    background: rgba(251, 191, 36, 0.1);
    border-color: rgba(251, 191, 36, 0.3);

    .error-alert__icon {
      color: #fbbf24;
    }
  }

  &--info {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);

    .error-alert__icon {
      color: #3b82f6;
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
  color: $text-primary;
  font-size: $font-base;
  line-height: 1.5;
}

.error-alert__dismiss {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xs;
  background: transparent;
  border: none;
  border-radius: $radius-md;
  color: $text-muted;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: $text-primary;
  }

  &:active {
    transform: scale(0.95);
  }
}

// Transition animations
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
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
