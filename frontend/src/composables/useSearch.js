import { ref } from 'vue';

const isSearchOpen = ref(false);
const searchQuery = ref('');

export function useSearch() {
  const openSearch = () => {
    isSearchOpen.value = true;
  };

  const closeSearch = () => {
    isSearchOpen.value = false;
    searchQuery.value = ''; // Clear search when closing
  };

  const toggleSearch = () => {
    isSearchOpen.value = !isSearchOpen.value;
    if (!isSearchOpen.value) {
      searchQuery.value = ''; // Clear search when closing
    }
  };

  return {
    isSearchOpen,
    searchQuery,
    openSearch,
    closeSearch,
    toggleSearch
  };
}
