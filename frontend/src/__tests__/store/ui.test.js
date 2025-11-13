import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUiStore } from '@/store/ui.js';

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have loadingCount of 0', () => {
      const store = useUiStore();
      expect(store.loadingCount).toBe(0);
    });

    it('should have showSpinner of false', () => {
      const store = useUiStore();
      expect(store.showSpinner).toBe(false);
    });

    it('should have isLoading getter of false', () => {
      const store = useUiStore();
      expect(store.isLoading).toBe(false);
    });
  });

  describe('startLoading', () => {
    it('should increment loadingCount', () => {
      const store = useUiStore();

      store.startLoading();
      expect(store.loadingCount).toBe(1);

      store.startLoading();
      expect(store.loadingCount).toBe(2);
    });

    it('should set isLoading to true', () => {
      const store = useUiStore();

      store.startLoading();
      expect(store.isLoading).toBe(true);
    });

    it('should not show spinner immediately', () => {
      const store = useUiStore();

      store.startLoading();
      expect(store.showSpinner).toBe(false);
    });

    it('should not show spinner if loading completes before delay', () => {
      const store = useUiStore();

      store.startLoading();
      vi.advanceTimersByTime(100);
      store.stopLoading();
      vi.advanceTimersByTime(100);

      expect(store.showSpinner).toBe(false);
    });
  });

  describe('stopLoading', () => {
    it('should decrement loadingCount', () => {
      const store = useUiStore();

      store.startLoading();
      store.startLoading();
      expect(store.loadingCount).toBe(2);

      store.stopLoading();
      expect(store.loadingCount).toBe(1);
    });

    it('should not decrement below 0', () => {
      const store = useUiStore();

      store.stopLoading();
      expect(store.loadingCount).toBe(0);
    });

    it('should set isLoading to false when count reaches 0', () => {
      const store = useUiStore();

      store.startLoading();
      store.stopLoading();

      expect(store.isLoading).toBe(false);
    });

    it('should hide spinner when loading completes', () => {
      const store = useUiStore();

      store.startLoading();
      vi.advanceTimersByTime(200);
      expect(store.showSpinner).toBe(true);

      store.stopLoading();
      expect(store.showSpinner).toBe(false);
    });

    it('should clear delay timer if loading completes early', () => {
      const store = useUiStore();

      store.startLoading();
      store.stopLoading();

      // Advance past delay time
      vi.advanceTimersByTime(200);

      // Spinner should never have appeared
      expect(store.showSpinner).toBe(false);
    });
  });

  describe('resetLoading', () => {
    it('should reset loadingCount to 0', () => {
      const store = useUiStore();

      store.startLoading();
      store.startLoading();
      store.resetLoading();

      expect(store.loadingCount).toBe(0);
    });

    it('should hide spinner', () => {
      const store = useUiStore();

      store.startLoading();
      vi.advanceTimersByTime(200);
      expect(store.showSpinner).toBe(true);

      store.resetLoading();
      expect(store.showSpinner).toBe(false);
    });

    it('should clear pending timer', () => {
      const store = useUiStore();

      store.startLoading();
      store.resetLoading();
      vi.advanceTimersByTime(200);

      // Spinner should never appear
      expect(store.showSpinner).toBe(false);
    });
  });

  describe('nested loading operations', () => {
    it('should handle multiple concurrent loading operations', () => {
      const store = useUiStore();

      // Start three operations
      store.startLoading(); // 1
      store.startLoading(); // 2
      store.startLoading(); // 3

      expect(store.loadingCount).toBe(3);
      expect(store.isLoading).toBe(true);

      // Complete first operation
      store.stopLoading();
      expect(store.loadingCount).toBe(2);
      expect(store.isLoading).toBe(true);

      // Complete second operation
      store.stopLoading();
      expect(store.loadingCount).toBe(1);
      expect(store.isLoading).toBe(true);

      // Complete third operation
      store.stopLoading();
      expect(store.loadingCount).toBe(0);
      expect(store.isLoading).toBe(false);
    });

    it('should only start delay timer once for concurrent operations', () => {
      const store = useUiStore();

      store.startLoading();
      store.startLoading();
      store.startLoading();

      vi.advanceTimersByTime(200);

      expect(store.showSpinner).toBe(true);
    });
  });
});
