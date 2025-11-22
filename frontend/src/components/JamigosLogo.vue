<template>
  <img
    src="/jamigos-logo.svg"
    alt="Jamigos logo"
    :width="width"
    :height="height"
    class="jamigos-logo"
  />
</template>

<script setup>
const props = defineProps({
  width: {
    type: [Number, String],
    default: 'auto'
  },
  height: {
    type: [Number, String],
    default: 32
  }
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
