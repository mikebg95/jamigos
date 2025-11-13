import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deduplicateRequest, clearRequestCache, getPendingRequestCount } from '@/utils/requestCache.js';

describe('requestCache', () => {
  beforeEach(() => {
    clearRequestCache();
  });

  describe('deduplicateRequest', () => {
    it('should execute the fetch function', async () => {
      const fetchFn = vi.fn().mockResolvedValue('result');

      const result = await deduplicateRequest('/api/test', {}, fetchFn);

      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');
    });

    it('should deduplicate identical requests', async () => {
      const fetchFn = vi.fn().mockResolvedValue('result');

      // Fire off two identical requests simultaneously
      const [result1, result2] = await Promise.all([
        deduplicateRequest('/api/test', { method: 'GET' }, fetchFn),
        deduplicateRequest('/api/test', { method: 'GET' }, fetchFn),
      ]);

      // Fetch should only be called once
      expect(fetchFn).toHaveBeenCalledTimes(1);
      // Both should get the same result
      expect(result1).toBe('result');
      expect(result2).toBe('result');
    });

    it('should not deduplicate different URLs', async () => {
      const fetchFn1 = vi.fn().mockResolvedValue('result1');
      const fetchFn2 = vi.fn().mockResolvedValue('result2');

      await Promise.all([
        deduplicateRequest('/api/test1', {}, fetchFn1),
        deduplicateRequest('/api/test2', {}, fetchFn2),
      ]);

      expect(fetchFn1).toHaveBeenCalledTimes(1);
      expect(fetchFn2).toHaveBeenCalledTimes(1);
    });

    it('should not deduplicate different methods', async () => {
      const fetchFn1 = vi.fn().mockResolvedValue('result1');
      const fetchFn2 = vi.fn().mockResolvedValue('result2');

      await Promise.all([
        deduplicateRequest('/api/test', { method: 'GET' }, fetchFn1),
        deduplicateRequest('/api/test', { method: 'POST' }, fetchFn2),
      ]);

      expect(fetchFn1).toHaveBeenCalledTimes(1);
      expect(fetchFn2).toHaveBeenCalledTimes(1);
    });

    it('should not deduplicate different bodies', async () => {
      const fetchFn1 = vi.fn().mockResolvedValue('result1');
      const fetchFn2 = vi.fn().mockResolvedValue('result2');

      await Promise.all([
        deduplicateRequest('/api/test', { method: 'POST', body: 'body1' }, fetchFn1),
        deduplicateRequest('/api/test', { method: 'POST', body: 'body2' }, fetchFn2),
      ]);

      expect(fetchFn1).toHaveBeenCalledTimes(1);
      expect(fetchFn2).toHaveBeenCalledTimes(1);
    });

    it('should clear cache after request completes', async () => {
      const fetchFn = vi.fn().mockResolvedValue('result');

      expect(getPendingRequestCount()).toBe(0);

      const promise = deduplicateRequest('/api/test', {}, fetchFn);
      expect(getPendingRequestCount()).toBe(1);

      await promise;
      expect(getPendingRequestCount()).toBe(0);
    });

    it('should clear cache even if request fails', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('failed'));

      expect(getPendingRequestCount()).toBe(0);

      try {
        await deduplicateRequest('/api/test', {}, fetchFn);
      } catch (e) {
        // Expected to fail
      }

      expect(getPendingRequestCount()).toBe(0);
    });

    it('should allow new request after previous one completes', async () => {
      const fetchFn1 = vi.fn().mockResolvedValue('result1');
      const fetchFn2 = vi.fn().mockResolvedValue('result2');

      // First request
      await deduplicateRequest('/api/test', {}, fetchFn1);
      expect(fetchFn1).toHaveBeenCalledTimes(1);

      // Second request after first completes
      await deduplicateRequest('/api/test', {}, fetchFn2);
      expect(fetchFn2).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearRequestCache', () => {
    it('should clear all pending requests', async () => {
      const fetchFn = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

      deduplicateRequest('/api/test1', {}, fetchFn);
      deduplicateRequest('/api/test2', {}, fetchFn);

      expect(getPendingRequestCount()).toBe(2);

      clearRequestCache();

      expect(getPendingRequestCount()).toBe(0);
    });
  });

  describe('getPendingRequestCount', () => {
    it('should return 0 when no requests are pending', () => {
      expect(getPendingRequestCount()).toBe(0);
    });

    it('should return correct count of pending requests', () => {
      const fetchFn = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

      deduplicateRequest('/api/test1', {}, fetchFn);
      expect(getPendingRequestCount()).toBe(1);

      deduplicateRequest('/api/test2', {}, fetchFn);
      expect(getPendingRequestCount()).toBe(2);
    });
  });
});
