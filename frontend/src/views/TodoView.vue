<script setup>
import { ref, onMounted } from 'vue';
import ItemService from '@/service/ItemService.js';
import { VALIDATION } from '@/config/constants';
import { useItemOperations } from '@/composables/useItemOperations.js';
import { useToastStore } from '@/store/toast.js';
import SkeletonLoader from '@/components/SkeletonLoaderComponent.vue';

// Use composable for item operations
const { items, loading, error, loadItems, deleteItem } = useItemOperations();
const toast = useToastStore();

const newItem = ref('');
const MAX_ITEM_LENGTH = VALIDATION.MAX_TASK_LENGTH;

async function addItem() {
  const text = newItem.value.toString().trim();

  // Input validation
  if (!text) {
    toast.warning('Please enter a task description.');
    return;
  }

  if (text.length > MAX_ITEM_LENGTH) {
    toast.warning(`Task description is too long (maximum ${MAX_ITEM_LENGTH} characters).`);
    return;
  }

  try {
    await ItemService.addItem(text);
    await loadItems();
    newItem.value = '';
    toast.success('Task added successfully!');
  } catch (e) {
    if (e.message.includes('timeout')) {
      toast.error('Request timed out. Please try adding the item again.');
    } else if (e.message.includes('403')) {
      toast.error("You don't have permission to add items.");
    } else {
      toast.error('Failed to add item. Please try again.');
    }
    if (import.meta.env.DEV) {
      console.error('Add item error:', e);
    }
  }
}

onMounted(loadItems);
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Tasks</h1>

      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <SkeletonLoader type="list" :count="3" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button @click="loadItems" class="retry-btn">Retry</button>
      </div>

      <!-- Empty state (only shown when successfully loaded but no items) -->
      <div v-else-if="!items.length" class="empty-state">
        <p>No tasks yet. Add one below to get started!</p>
      </div>

      <!-- Items list -->
      <ul v-else role="list" aria-label="Your tasks">
        <li v-for="item in items" :key="item.id" class="task-item">
          <span class="task-text">{{ item.text }}</span>
          <button
            @click="deleteItem(item.id)"
            class="delete-btn"
            :aria-label="`Delete task: ${item.text}`"
          >
            DELETE
          </button>
        </li>
      </ul>

      <!-- Add new item form (only show when not loading and no error) -->
      <form v-if="!loading && !error" @submit.prevent="addItem" class="add-form" aria-label="Add new task">
        <label for="new-task" class="sr-only">New task description</label>
        <input
          id="new-task"
          v-model="newItem"
          type="text"
          :placeholder="`Add a new task (max ${MAX_ITEM_LENGTH} characters)`"
          autocomplete="off"
          :maxlength="MAX_ITEM_LENGTH"
        />
        <button type="submit" aria-label="Add task">Add</button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/scss/variables' as *;

.error-state {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
  margin-bottom: var(--ds-spacing-lg);
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
