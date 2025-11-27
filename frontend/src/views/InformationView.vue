<script setup>
import { onMounted } from 'vue';
import { useItemOperations } from '@/composables/useItemOperations.js';
import SkeletonLoader from '@/components/SkeletonLoaderComponent.vue';

// Use composable for item operations (admin view - loads all items)
const { items, loading, error, loadItems, deleteItem } = useItemOperations(true);

onMounted(loadItems);
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>All Items (Admin View)</h1>

      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <SkeletonLoader type="list" :count="5" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button @click="loadItems" class="retry-btn">Retry</button>
      </div>

      <!-- Empty state (only shown when successfully loaded but no items) -->
      <div v-else-if="!items.length" class="empty-state">
        <p>No items found in the system.</p>
      </div>

      <!-- Items list -->
      <ul v-else role="list" aria-label="All items in the system">
        <li v-for="item in items" :key="item.id" class="item">
          <span class="item-text">{{ item.text }}</span>
          <button
            @click="deleteItem(item.id)"
            class="delete-btn"
            :aria-label="`Delete item: ${item.text}`"
          >
            DELETE
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/scss/variables' as *;

button {
  border: 2px solid red;
}

.error-state {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
  margin-top: var(--ds-spacing-lg);
}

.error-message {
  color: var(--ds-color-text-secondary);
  font-size: var(--ds-font-size-base);
  margin: 0;
}

.retry-btn {
  align-self: flex-start;
  padding: var(--ds-spacing-xs) var(--ds-spacing-md);
  border: 1px solid var(--ds-color-border);
  background: transparent;
  color: var(--ds-color-text-secondary);
  border-radius: var(--ds-radius-md);
  font-size: var(--ds-font-size-sm);
  font-weight: var(--ds-font-weight-medium);
  cursor: pointer;
  transition: all var(--ds-duration-fast) var(--ds-ease-standard);

  &:hover {
    border-color: var(--ds-color-text-primary);
    color: var(--ds-color-text-primary);
    background: var(--ds-color-surface-hover);
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>
