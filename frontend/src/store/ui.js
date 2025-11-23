import { defineStore } from 'pinia';
import { TIMING } from '@/config/constants';

// Move timer outside of Pinia state to prevent memory leaks
// Timers in state can cause issues if the store is recreated
let delayTimer = null;

export const useUiStore = defineStore('ui', {
    state: () => ({
        loadingCount: 0,
        showSpinner: false,
        showLogoutSplash: false, // Mobile-only: show splash during logout
    }),
    getters: {
        isLoading: (s) => s.loadingCount > 0,
    },
    actions: {
        startLoading() {
            this.loadingCount++;

            // Only start the delay timer when the first loading operation begins
            if (this.loadingCount === 1 && !delayTimer) {
                delayTimer = setTimeout(() => {
                    // After delay, if still loading, show the spinner
                    if (this.loadingCount > 0) {
                        this.showSpinner = true;
                    }
                    delayTimer = null;
                }, TIMING.SPINNER_DELAY_MS);
            }
        },

        stopLoading() {
            if (this.loadingCount > 0) {
                this.loadingCount--;
            }

            // When all loading operations complete, clean up
            if (this.loadingCount === 0) {
                // Clear the delay timer if it hasn't fired yet
                if (delayTimer) {
                    clearTimeout(delayTimer);
                    delayTimer = null;
                }
                // Hide the spinner
                this.showSpinner = false;
            }
        },

        resetLoading() {
            // Clear any pending timer
            if (delayTimer) {
                clearTimeout(delayTimer);
                delayTimer = null;
            }
            this.loadingCount = 0;
            this.showSpinner = false;
        },

        // Mobile logout splash actions
        startLogoutSplash() {
            console.log('[UI Store] Starting logout splash');
            this.showLogoutSplash = true;
        },

        stopLogoutSplash() {
            console.log('[UI Store] Stopping logout splash');
            this.showLogoutSplash = false;
        },
    },
});