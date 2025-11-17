import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: []
  }),

  actions: {
    addToast({ message, type = 'error', duration = 5000 }) {
      const id = Date.now() + Math.random()

      this.toasts.push({
        id,
        message,
        type, // 'error', 'warning', 'info', 'success'
        duration
      })

      // Auto-remove toast after duration (if duration > 0)
      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id)
        }, duration)
      }

      return id
    },

    removeToast(id) {
      const index = this.toasts.findIndex(toast => toast.id === id)
      if (index !== -1) {
        this.toasts.splice(index, 1)
      }
    },

    // Convenience methods
    error(message, duration = 7000) {
      return this.addToast({ message, type: 'error', duration })
    },

    warning(message, duration = 5000) {
      return this.addToast({ message, type: 'warning', duration })
    },

    info(message, duration = 4000) {
      return this.addToast({ message, type: 'info', duration })
    },

    success(message, duration = 3000) {
      return this.addToast({ message, type: 'success', duration })
    },

    clearAll() {
      this.toasts = []
    }
  }
})
