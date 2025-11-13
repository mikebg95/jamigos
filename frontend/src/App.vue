<script setup>
import NavbarComponent from "@/components/NavbarComponent.vue";
import { useUiStore } from "@/store/ui.js";
import { DotLoader } from "vue3-spinner";
import { watch, onBeforeUnmount, onErrorCaptured, ref } from "vue";
import { setInteractionLocked, unlockUI } from "@/utils/interactionsLock.js";
import * as Sentry from "@sentry/vue";

const ui = useUiStore();

// Global error boundary
const error = ref(null);
const errorDetails = ref('');

onErrorCaptured((err, instance, info) => {
  error.value = err;
  errorDetails.value = info;
  console.error('Global error captured:', err, info);

  // Send error to Sentry for tracking
  Sentry.captureException(err, {
    contexts: {
      vue: {
        componentName: instance?.$options?.name || 'Unknown',
        errorInfo: info,
      },
    },
  });

  // Stop error propagation
  return false;
});

const reload = () => {
  error.value = null;
  errorDetails.value = '';
  window.location.reload();
};

// Toggle global interaction lock when spinner is visible (after delay)
watch(() => ui.showSpinner, setInteractionLocked, { immediate: true });

// Safety: ensure unlock on unmount
onBeforeUnmount(() => unlockUI());
</script>

<template>
  <!-- Global error boundary -->
  <div v-if="error" class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h1>Something went wrong</h1>
      <p class="error-message">We encountered an unexpected error. Please try reloading the page.</p>
      <div class="error-actions">
        <button @click="reload" class="btn btn-primary">
          Reload Page
        </button>
      </div>
      <details class="error-details">
        <summary>Technical Details</summary>
        <pre>{{ error.message }}</pre>
      </details>
    </div>
  </div>

  <!-- Normal app content -->
  <template v-else>
    <!-- spinner overlay with 200ms delay; app stays mounted underneath -->
    <Transition name="fade">
      <div
        v-if="ui.showSpinner"
        class="spinner-overlay"
        role="alert"
        aria-live="polite"
        aria-label="Loading content"
      >
        <DotLoader size="50px" color="#667eea" />
        <span class="sr-only">Loading, please wait...</span>
      </div>
    </Transition>

    <div class="app-container">
      <NavbarComponent />
      <main id="main-content">
        <router-view class="container" />
      </main>
    </div>
  </template>
</template>

<style scoped lang="scss">
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.container {
  padding: $spacing-md;
}

.spinner-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px);
  z-index: $z-toast;
}

/* Fade transition for smooth spinner appearance */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Error boundary page */
.error-page {
  @include flex-center;
  min-height: 100vh;
  @include gradient-background;
  padding: $spacing-xl;
}

.error-content {
  @include flex-column;
  align-items: center;
  text-align: center;
  max-width: 600px;
  @include glass(0.05);
  padding: $spacing-4xl $spacing-xl;
  border-radius: $radius-2xl;
}

.error-icon {
  @include flex-center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  margin-bottom: $spacing-xl;

  svg {
    color: $color-error;
  }
}

.error-message {
  color: $text-secondary;
  font-size: $font-lg;
  margin: $spacing-md 0 $spacing-2xl;
}

.error-actions {
  margin-bottom: $spacing-xl;
}

.error-details {
  margin-top: $spacing-xl;
  width: 100%;
  text-align: left;

  summary {
    cursor: pointer;
    color: $text-muted;
    font-size: $font-sm;
    user-select: none;

    &:hover {
      color: $text-secondary;
    }
  }

  pre {
    margin-top: $spacing-md;
    padding: $spacing-md;
    background: rgba(0, 0, 0, 0.3);
    border-radius: $radius-md;
    color: $color-error;
    font-size: $font-sm;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>