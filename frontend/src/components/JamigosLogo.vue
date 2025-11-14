<template>
  <img
    :src="logoSrc"
    :alt="altText"
    :width="width"
    :height="height"
    class="jamigos-logo"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'full',
    validator: (value) => ['full', 'minimal'].includes(value)
  },
  width: {
    type: [Number, String],
    default: 'auto'
  },
  height: {
    type: [Number, String],
    default: 32
  }
})

const logoSrc = computed(() => {
  return props.variant === 'minimal'
    ? '/jamigos-logo-minimal.svg'
    : '/jamigos-logo.svg'
})

const altText = computed(() => {
  return props.variant === 'minimal'
    ? 'Jamigos icon'
    : 'Jamigos logo'
})
</script>

<style scoped>
.jamigos-logo {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
  filter: none;
}

/* Invert logo colors in dark mode */
:root[data-theme='dark'] .jamigos-logo {
  filter: invert(1) brightness(1.2);
}
</style>
