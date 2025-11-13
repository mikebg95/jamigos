import { defineStore } from 'pinia';

const SPINNER_DELAY_MS = 200;

export const useUiStore = defineStore('ui', {
    state: () => ({
        loadingCount: 0,
        showSpinner: false,
        delayTimer: null,
    }),
    getters: {
        isLoading: (s) => s.loadingCount > 0,
    },
    actions: {
        startLoading() {
            this.loadingCount++;

            // Only start the delay timer when the first loading operation begins
            if (this.loadingCount === 1 && !this.delayTimer) {
                this.delayTimer = setTimeout(() => {
                    // After 200ms, if still loading, show the spinner
                    if (this.loadingCount > 0) {
                        this.showSpinner = true;
                    }
                    this.delayTimer = null;
                }, SPINNER_DELAY_MS);
            }
        },

        stopLoading() {
            if (this.loadingCount > 0) {
                this.loadingCount--;
            }

            // When all loading operations complete, clean up
            if (this.loadingCount === 0) {
                // Clear the delay timer if it hasn't fired yet
                if (this.delayTimer) {
                    clearTimeout(this.delayTimer);
                    this.delayTimer = null;
                }
                // Hide the spinner
                this.showSpinner = false;
            }
        },

        resetLoading() {
            // Clear any pending timer
            if (this.delayTimer) {
                clearTimeout(this.delayTimer);
                this.delayTimer = null;
            }
            this.loadingCount = 0;
            this.showSpinner = false;
        },
    },
});