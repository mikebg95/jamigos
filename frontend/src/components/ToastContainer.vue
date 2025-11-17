<script setup>
import { useToastStore } from '@/store/toast.js'
import ErrorAlert from '@/components/ErrorAlertComponent.vue'

const toastStore = useToastStore()

const handleDismiss = (toastId) => {
  toastStore.removeToast(toastId)
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast-slide">
        <ErrorAlert
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :message="toast.message"
          :type="toast.type"
          :dismissible="true"
          @dismiss="handleDismiss(toast.id)"
          class="toast-item"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/scss/variables' as *;

.toast-container {
  position: fixed;
  top: 80px; // Below navbar (adjust based on your navbar height)
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  z-index: $z-toast;
  padding: 0 var(--ds-spacing-base);
  pointer-events: none; // Allow clicks to pass through container

  @media (max-width: $breakpoint-md) {
    top: 70px; // Slightly higher on mobile
    max-width: 100%;
    padding: 0 var(--ds-spacing-sm);
  }
}

.toast-item {
  margin-bottom: var(--ds-spacing-sm);
  pointer-events: auto; // But toasts themselves should be clickable
  box-shadow: var(--ds-shadow-elevated);
}

// Toast slide animations
.toast-slide-enter-active {
  animation: toast-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-leave-active {
  animation: toast-slide-out 0.3s cubic-bezier(0.32, 0, 0.67, 0);
}

.toast-slide-move {
  transition: transform 0.3s ease;
}

@keyframes toast-slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-slide-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
}
</style>
