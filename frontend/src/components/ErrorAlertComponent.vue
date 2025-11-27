<script setup>
import { ref, computed } from 'vue';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-vue-next';
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
    default: 'error', // error, warning, info, success
    validator: (value) => ['error', 'warning', 'info', 'success'].includes(value),
  },
});

// Select icon based on type
const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Info;
    case 'error':
    default:
      return AlertCircle;
  }
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
        <component
            :is="icon"
            :size="UI.ICON_SIZE_SM"
            :stroke-width="UI.ICON_STROKE_WIDTH"
            aria-hidden="true"
        />
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
        <X
            :size="UI.ICON_SIZE_SM"
            :stroke-width="UI.ICON_STROKE_WIDTH"
            aria-hidden="true"
        />
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
  border: 1px solid;
  animation: slideDown 0.3s ease-out;
  color: #1f2937; // Dark text for light mode

  &--error {
    background: #fee;
    border-color: #fcc;
    color: #000000;

    .error-alert__icon {
      color: #dc2626;
    }

    .error-alert__message {
      color: #000000;
    }
  }

  &--warning {
    background: #fef3c7;
    border-color: #fde68a;
    color: #000000;

    .error-alert__icon {
      color: #d97706;
    }

    .error-alert__message {
      color: #000000;
    }
  }

  &--info {
    background: #dbeafe;
    border-color: #bfdbfe;
    color: #000000;

    .error-alert__icon {
      color: #2563eb;
    }

    .error-alert__message {
      color: #000000;
    }
  }

  &--success {
    background: #dcfce7;
    border-color: #bbf7d0;
    color: #000000;

    .error-alert__icon {
      color: #16a34a;
    }

    .error-alert__message {
      color: #000000;
    }
  }
}

// Dark mode support
:root[data-theme='dark'] {
  .error-alert {
    &--error {
      background: #7f1d1d;
      border-color: #991b1b;
      color: #fecaca;

      .error-alert__icon {
        color: #fca5a5;
      }

      .error-alert__message {
        color: #fecaca;
      }
    }

    &--warning {
      background: #78350f;
      border-color: #92400e;
      color: #fde68a;

      .error-alert__icon {
        color: #fbbf24;
      }

      .error-alert__message {
        color: #fde68a;
      }
    }

    &--info {
      background: #1e3a8a;
      border-color: #1e40af;
      color: #bfdbfe;

      .error-alert__icon {
        color: #93c5fd;
      }

      .error-alert__message {
        color: #bfdbfe;
      }
    }

    &--success {
      background: #14532d;
      border-color: #166534;
      color: #bbf7d0;

      .error-alert__icon {
        color: #86efac;
      }

      .error-alert__message {
        color: #bbf7d0;
      }
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