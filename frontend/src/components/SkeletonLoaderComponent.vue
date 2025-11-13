<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'text', // text, rect, circle, list
    validator: (value) => ['text', 'rect', 'circle', 'list'].includes(value),
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '1rem',
  },
  count: {
    type: Number,
    default: 1,
  },
  gap: {
    type: String,
    default: '0.5rem',
  },
});
</script>

<template>
  <div class="skeleton-wrapper" :style="{ gap }">
    <!-- List type: multiple skeleton items -->
    <template v-if="type === 'list'">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-item skeleton-item--list"
      >
        <div class="skeleton skeleton--circle" style="width: 40px; height: 40px;"></div>
        <div class="skeleton-text-block">
          <div class="skeleton skeleton--text" style="width: 60%; height: 1rem;"></div>
          <div class="skeleton skeleton--text" style="width: 40%; height: 0.875rem;"></div>
        </div>
      </div>
    </template>

    <!-- Single skeleton items -->
    <template v-else>
      <div
        v-for="i in count"
        :key="i"
        :class="['skeleton', `skeleton--${type}`]"
        :style="{ width, height }"
      ></div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.skeleton-wrapper {
  display: flex;
  flex-direction: column;
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: $radius-md;

  &--text {
    height: 1rem;
    border-radius: $radius-sm;
  }

  &--rect {
    border-radius: $radius-lg;
  }

  &--circle {
    border-radius: 50%;
  }
}

.skeleton-item--list {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: rgba(255, 255, 255, 0.02);
  border-radius: $radius-lg;
}

.skeleton-text-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
