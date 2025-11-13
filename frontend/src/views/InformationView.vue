<script setup>
import { onMounted } from 'vue';
import { useItemOperations } from '@/composables/useItemOperations.js';
import ErrorAlert from '@/components/ErrorAlertComponent.vue';
import SkeletonLoader from '@/components/SkeletonLoaderComponent.vue';

// Use composable for item operations (admin view - loads all items)
const { items, error, loading, loadItems, deleteItem } = useItemOperations(true);

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

      <!-- Empty state -->
      <div v-else-if="!items.length && !error" class="empty-state">
        <p>No items found in the system.</p>
      </div>

      <!-- Items list -->
      <ul v-else-if="items.length" role="list" aria-label="All items in the system">
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

      <!-- Error message -->
      <ErrorAlert
        v-if="error"
        :message="error"
        @dismiss="error = ''"
      />
    </div>
  </div>
</template>

<style scoped>
button {
  border: 2px solid red;
}
</style>
