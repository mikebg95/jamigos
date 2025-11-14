<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="jamigos-logo"
  >
    <!-- Guitar pick outline -->
    <path
      d="M16 2C12 2 9 4 7 6C5 8 4 11 4 14C4 17 5 20 7 23C9 26 12 28 16 30C20 28 23 26 25 23C27 20 28 17 28 14C28 11 27 8 25 6C23 4 20 2 16 2Z"
      :fill="pickFill"
      :stroke="pickStroke"
      stroke-width="0.5"
      opacity="0.15"
    />

    <!-- Modern G-clef (simplified geometric version) -->
    <path
      d="M18 8C17.5 8 17 8.2 16.7 8.5C16.4 8.8 16.3 9.2 16.3 9.6V16.5C16 16.2 15.6 16 15 16C13.9 16 13 16.9 13 18C13 19.1 13.9 20 15 20C16.1 20 17 19.1 17 18V11.5C17.3 11.8 17.7 12 18.5 12C19.3 12 20 11.3 20 10.5C20 9.7 19.3 9 18.5 9C18.2 9 18 8.9 18 8.7V8Z"
      fill="url(#jamigos-gradient)"
    />

    <!-- Stylized clef accent line -->
    <path
      d="M15 10.5C15 10.2 15.2 10 15.5 10C15.8 10 16 10.2 16 10.5V12.5C16 12.8 15.8 13 15.5 13C15.2 13 15 12.8 15 12.5V10.5Z"
      fill="url(#jamigos-gradient)"
      opacity="0.7"
    />

    <!-- Small music note accent -->
    <circle
      cx="19"
      cy="18"
      r="1.2"
      fill="url(#jamigos-gradient)"
      opacity="0.8"
    />

    <!-- Gradient Definition -->
    <defs>
      <linearGradient
        id="jamigos-gradient"
        x1="4"
        y1="4"
        x2="28"
        y2="28"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#667eea"/>
        <stop offset="0.5" stop-color="#764ba2"/>
        <stop offset="1" stop-color="#f093fb"/>
      </linearGradient>
      <linearGradient
        id="pick-gradient"
        x1="4"
        y1="4"
        x2="28"
        y2="28"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#667eea" stop-opacity="0.3"/>
        <stop offset="1" stop-color="#764ba2" stop-opacity="0.3"/>
      </linearGradient>
    </defs>
  </svg>
</template>

<script setup>
const props = defineProps({
  size: {
    type: [Number, String],
    default: 32
  },
  pickFill: {
    type: String,
    default: 'url(#pick-gradient)'
  },
  pickStroke: {
    type: String,
    default: '#667eea'
  }
})
</script>

<style scoped>
.jamigos-logo {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
