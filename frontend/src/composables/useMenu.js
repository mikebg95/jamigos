import { ref } from 'vue'

const isMenuOpen = ref(false)

export function useMenu() {
  const openMenu = () => {
    isMenuOpen.value = true
  }

  const closeMenu = () => {
    isMenuOpen.value = false
  }

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }

  return {
    isMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu
  }
}
