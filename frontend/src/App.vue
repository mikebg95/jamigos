<script setup>
import NavbarComponent from "@/components/NavbarComponent.vue";
import ToastContainer from "@/components/ToastContainer.vue";
import MobileSplashIntro from "@/components/MobileSplashIntro.vue";
import { useUiStore } from "@/store/ui.js";
import { DotLoader } from "vue3-spinner";
import { watch, onBeforeUnmount, onErrorCaptured, ref, computed } from "vue";
import { setInteractionLocked, unlockUI } from "@/utils/interactionsLock.js";
import * as Sentry from "@sentry/vue";
import { useRoute } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

const ui = useUiStore();
const route = useRoute();
const isNative = Capacitor.isNativePlatform();

// Mobile splash intro state (only shown once per app session)
const showSplashIntro = ref(isNative);
const hasSeenSplashIntro = ref(false);

const handleSplashComplete = async () => {
  hasSeenSplashIntro.value = true;
  showSplashIntro.value = false;

  // Hide native splash screen after animated intro
  if (isNative) {
    await SplashScreen.hide();
  }
};

// Hide top bar on mobile auth entry screen only
const hideTopBar = computed(() => {
  return isNative && (route.path === '/mobile-auth' || route.name === 'MobileAuthEntry');
});

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
    <!-- Mobile Splash Intro (only on native, only once per session) -->
    <MobileSplashIntro
      v-if="showSplashIntro"
      :on-complete="handleSplashComplete"
    />

    <!-- Main app (hidden behind splash intro initially on mobile) -->
    <template v-if="!showSplashIntro || !isNative">
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

      <!-- Global toast notifications -->
      <ToastContainer />

      <div class="app-container">
        <NavbarComponent v-if="!hideTopBar" />
        <main id="main-content" :class="{ 'no-topbar': hideTopBar }">
          <router-view class="container" />
        </main>
      </div>
    </template>
  </template>
</template>

<style scoped lang="scss">
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.container {
  padding: var(--ds-spacing-base);
}

// Pages without topbar need safe-area padding on mobile
#main-content.no-topbar {
  @media (max-width: $breakpoint-md) {
    padding-top: constant(safe-area-inset-top); /* iOS 11.0-11.2 */
    padding-top: env(safe-area-inset-top); /* iOS 11.2+ and Android */
  }
}

.spinner-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
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
  background: var(--ds-color-background);
  padding: var(--ds-spacing-xl);
}

.error-content {
  @include flex-column;
  align-items: center;
  text-align: center;
  max-width: 600px;
  background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border-subtle);
  padding: var(--ds-spacing-4xl) var(--ds-spacing-xl);
  border-radius: var(--ds-radius-2xl);
  box-shadow: var(--ds-shadow-elevated);
}

.error-icon {
  @include flex-center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(217, 83, 79, 0.15);
  margin-bottom: var(--ds-spacing-xl);

  svg {
    color: var(--ds-color-error);
  }
}

.error-message {
  color: var(--ds-color-text-secondary);
  font-size: var(--ds-font-size-lg);
  margin: var(--ds-spacing-base) 0 var(--ds-spacing-2xl);
}

.error-actions {
  margin-bottom: var(--ds-spacing-xl);
}

.error-details {
  margin-top: var(--ds-spacing-xl);
  width: 100%;
  text-align: left;

  summary {
    cursor: pointer;
    color: var(--ds-color-text-tertiary);
    font-size: var(--ds-font-size-sm);
    user-select: none;

    &:hover {
      color: var(--ds-color-text-secondary);
    }
  }

  pre {
    margin-top: var(--ds-spacing-base);
    padding: var(--ds-spacing-base);
    background: var(--ds-color-surface-subtle);
    border-radius: var(--ds-radius-md);
    color: var(--ds-color-error);
    font-size: var(--ds-font-size-sm);
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>