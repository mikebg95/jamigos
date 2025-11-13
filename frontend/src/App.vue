<script setup>
import NavbarComponent from "@/components/NavbarComponent.vue";
import { useUiStore } from "@/store/ui.js";
import { DotLoader } from "vue3-spinner";
import { watch, onBeforeUnmount } from "vue";
import { setInteractionLocked, unlockUI } from "@/utils/interactionsLock.js";

const ui = useUiStore();

// Toggle global interaction lock when spinner is visible (after delay)
watch(() => ui.showSpinner, setInteractionLocked, { immediate: true });

// Safety: ensure unlock on unmount
onBeforeUnmount(() => unlockUI());
</script>

<template>
  <!-- spinner overlay with 200ms delay; app stays mounted underneath -->
  <Transition name="fade">
    <div v-if="ui.showSpinner" class="spinner-overlay">
      <DotLoader size="50px" color="#667eea" />
    </div>
  </Transition>

  <div class="app-container">
    <NavbarComponent />
    <router-view class="container" />
  </div>
</template>

<style scoped lang="scss">
@use '@/scss/variables' as *;

.container {
  padding: 16px;
}

.spinner-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px);
  z-index: 9999;
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
</style>