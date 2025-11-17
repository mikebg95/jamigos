/**
 * Composable for managing item operations with loading, error handling, and race condition prevention
 * Extracted from TodoView and InformationView to eliminate code duplication
 */

import { ref } from 'vue';
import ItemService from '@/service/ItemService.js';
import { useToastStore } from '@/store/toast.js';

export function useItemOperations(getAllItems = false) {
  const items = ref([]);
  const loading = ref(false);
  const toast = useToastStore();

  /**
   * Track ongoing request to prevent race conditions
   *
   * Uses a non-reactive counter (not ref()) intentionally:
   * - Incremented on each new request
   * - Each request stores its ID and only updates UI if it's still the latest
   * - Prevents stale data from overwriting fresh data when requests complete out of order
   * - Non-reactive because we only need the value synchronously, not reactive updates
   */
  let currentLoadRequest = 0;

  /**
   * Load items with race condition prevention
   * @param {boolean} loadAll - If true, loads all items (admin view), otherwise loads user items
   */
  async function loadItems(loadAll = getAllItems) {
    const requestId = ++currentLoadRequest;

    loading.value = true;

    try {
      const result = loadAll
        ? await ItemService.getAllItems()
        : await ItemService.getItems();

      // Only update if this is still the latest request
      if (requestId === currentLoadRequest) {
        items.value = result;
      }
    } catch (e) {
      // Only show error if this is still the latest request
      if (requestId === currentLoadRequest) {
        toast.error(getErrorMessage(e));
        if (import.meta.env.DEV) {
          console.error('Load items error:', e);
        }
      }
    } finally {
      // Only clear loading if this is still the latest request
      if (requestId === currentLoadRequest) {
        loading.value = false;
      }
    }
  }

  /**
   * Delete an item
   * @param {string} id - Item ID to delete
   */
  async function deleteItem(id) {
    try {
      await ItemService.deleteItem(id);
      await loadItems();
      toast.success('Task deleted successfully!');
    } catch (e) {
      toast.error(getDeleteErrorMessage(e));
      if (import.meta.env.DEV) {
        console.error('Delete item error:', e);
      }
    }
  }

  /**
   * Get user-friendly error message for load operations
   * @param {Error} e - Error object
   * @returns {string} User-friendly error message
   */
  function getErrorMessage(e) {
    if (e.message.includes('timeout')) {
      return 'Request timed out. Please check your internet connection and try again.';
    } else if (e.message.includes('403')) {
      return "You don't have permission to view these items.";
    } else if (e.message.includes('404')) {
      return 'Items not found. Please refresh the page.';
    } else {
      return 'Unable to load items. Please refresh the page or try again later.';
    }
  }

  /**
   * Get user-friendly error message for delete operations
   * @param {Error} e - Error object
   * @returns {string} User-friendly error message
   */
  function getDeleteErrorMessage(e) {
    if (e.message.includes('timeout')) {
      return 'Request timed out. Please try deleting again.';
    } else if (e.message.includes('403')) {
      return "You don't have permission to delete this item.";
    } else if (e.message.includes('404')) {
      return 'Item not found. It may have already been deleted.';
    } else {
      return 'Failed to delete item. Please try again.';
    }
  }

  return {
    items,
    loading,
    loadItems,
    deleteItem,
  };
}
