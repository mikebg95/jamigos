<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  onComplete: {
    type: Function,
    required: true
  }
})

const isVisible = ref(true)
const logoVisible = ref(false)
const textVisible = ref(false)

onMounted(() => {
  // Sequence: Logo fades in → Text fades in → Fade out everything
  setTimeout(() => {
    logoVisible.value = true
  }, 100)

  setTimeout(() => {
    textVisible.value = true
  }, 400)

  // Start fade out after 1.5s
  setTimeout(() => {
    isVisible.value = false
  }, 2000)

  // Call completion callback after fade out animation (300ms)
  setTimeout(() => {
    props.onComplete()
  }, 1800)
})
</script>

<template>
  <Transition name="splash-fade">
    <div v-if="isVisible" class="mobile-splash-intro">
      <div class="splash-content">
        <!-- Logo with fade + scale animation (always in DOM, visibility controlled by class) -->
        <div class="logo-container" :class="{ 'is-visible': logoVisible }">
          <img
            src="/jamigos-logo.svg"
            alt="Jamigos"
            class="splash-logo"
          />
        </div>

        <!-- Text with fade animation (always in DOM, visibility controlled by class) -->
        <div class="text-container" :class="{ 'is-visible': textVisible }">
          <h1 class="splash-title">Jamigos</h1>
          <p class="splash-tagline">Where Musicians Connect & Create</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.mobile-splash-intro {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ds-color-background);
  overflow: hidden;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-xl);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  // Initial state: invisible and scaled down
  opacity: 0;
  transform: scale(0.8);
  // Smooth transition when becoming visible
  transition: opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
              transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  // Visible state: fade in + scale to normal size
  &.is-visible {
    opacity: 1;
    transform: scale(1);
  }
}

.splash-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;

  // Logo color based on theme (matching design system)
  // Light mode: black logo
  :root[data-theme='light'] &,
  :root:not([data-theme]) & {
    filter: none;
  }

  // Dark mode: white logo
  :root[data-theme='dark'] & {
    filter: invert(1) brightness(1.2);
  }
}

.text-container {
  text-align: center;
  // Initial state: invisible and shifted down
  opacity: 0;
  transform: translateY(20px);
  // Smooth transition when becoming visible
  transition: opacity 0.5s ease-out,
              transform 0.5s ease-out;

  // Visible state: fade in + slide to final position
  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}

.splash-title {
  font-size: var(--ds-font-size-4xl);
  font-weight: var(--ds-font-weight-bold);
  background: linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.splash-tagline {
  font-size: var(--ds-font-size-base);
  color: var(--ds-color-text-secondary);
  margin: var(--ds-spacing-md) 0 0 0;
  padding: 0;
}

// ===========================================
// ANIMATIONS
// ===========================================

// Main splash fade in/out (only used for entire splash screen)
.splash-fade-enter-active {
  animation: fade-in 0.3s ease-out;
}

.splash-fade-leave-active {
  animation: fade-out 0.3s ease-in;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

// Logo and text animations are now handled via CSS transitions
// on .logo-container.is-visible and .text-container.is-visible (see above)
</style>
