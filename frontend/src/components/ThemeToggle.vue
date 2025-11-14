<script setup>
import { ref, onMounted } from 'vue';
import { getTheme, toggleTheme } from '@/utils/theme.js';

const currentTheme = ref('light');

const handleToggle = () => {
  const newTheme = toggleTheme();
  currentTheme.value = newTheme;
};

onMounted(() => {
  currentTheme.value = getTheme();
});
</script>

<template>
  <button
    @click="handleToggle"
    class="theme-toggle"
    :aria-label="`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`"
    :title="`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`"
  >
    <!-- Sun icon (light mode) -->
    <svg
      v-if="currentTheme === 'dark'"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>

    <!-- Moon icon (dark mode) -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<style scoped lang="scss">
.theme-toggle {
  // Reset
  appearance: none;
  background: none;
  border: none;
  padding: 0;

  // Layout
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  // Visual
  color: var(--ds-color-text-secondary);
  background: var(--ds-color-surface-subtle);
  border-radius: var(--ds-radius-lg);
  cursor: pointer;

  // Transitions
  transition: all var(--ds-duration-normal) var(--ds-ease-emphasized);

  &:hover {
    color: var(--ds-color-text-primary);
    background: var(--ds-color-surface-hover);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--ds-color-primary);
    outline-offset: 2px;
  }

  svg {
    transition: transform var(--ds-duration-normal) var(--ds-ease-emphasized);
  }

  &:hover svg {
    transform: rotate(15deg);
  }
}
</style>
