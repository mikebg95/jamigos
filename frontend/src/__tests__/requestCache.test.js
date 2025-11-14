/* global it, jest */

import {
    deduplicateRequest,
    clearRequestCache,
    getPendingRequestCount,
} from '../utils/requestCache';

describe('requestCache', () => {
    beforeEach(() => {
        clearRequestCache();
    });

    it('deduplicates in-flight requests with the same URL, method and body', async () => {
        const fetchFn = jest.fn(() => Promise.resolve('ok'));

        const p1 = deduplicateRequest('/api/test', { method: 'GET' }, fetchFn);
        const p2 = deduplicateRequest('/api/test', { method: 'GET' }, fetchFn);

        // Only one underlying request should be executed
        expect(fetchFn).toHaveBeenCalledTimes(1);

        await expect(p1).resolves.toBe('ok');
        await expect(p2).resolves.toBe('ok');

        // Cache should be cleared after completion
        expect(getPendingRequestCount()).toBe(0);
    });

    it('treats different request keys as separate requests', async () => {
        const fetchFn1 = jest.fn(() => Promise.resolve('one'));
        const fetchFn2 = jest.fn(() => Promise.resolve('two'));

        const p1 = deduplicateRequest('/api/one', { method: 'GET' }, fetchFn1);
        const p2 = deduplicateRequest('/api/two', { method: 'GET' }, fetchFn2);

        expect(fetchFn1).toHaveBeenCalledTimes(1);
        expect(fetchFn2).toHaveBeenCalledTimes(1);

        await expect(p1).resolves.toBe('one');
        await expect(p2).resolves.toBe('two');

        expect(getPendingRequestCount()).toBe(0);
    });

    it('removes failed requests from the cache so they can be retried', async () => {
        const failingFetch = jest.fn(() => Promise.reject('fail'));
        const successfulFetch = jest.fn(() => Promise.resolve('success'));

        const p1 = deduplicateRequest('/api/fail', { method: 'GET' }, failingFetch);

        // First call fails
        await expect(p1).rejects.toBe('fail');

        // At this point the cache should be empty again
        expect(getPendingRequestCount()).toBe(0);

        // Retry the same request with a new fetch function
        const p2 = deduplicateRequest('/api/fail', { method: 'GET' }, successfulFetch);

        await expect(p2).resolves.toBe('success');
        expect(successfulFetch).toHaveBeenCalledTimes(1);
    });

    it('tracks the number of pending requests', async () => {
        let resolveFn;
        const fetchFn = jest.fn(
            () =>
                new Promise((resolve) => {
                    resolveFn = resolve;
                }),
        );

        const p1 = deduplicateRequest('/api/pending', {}, fetchFn);

        // While the promise is unresolved, it should count as pending
        expect(getPendingRequestCount()).toBe(1);

        // Deduped call should not increase count
        const p2 = deduplicateRequest('/api/pending', {}, fetchFn);
        expect(getPendingRequestCount()).toBe(1);
        expect(fetchFn).toHaveBeenCalledTimes(1);

        // Resolve the underlying promise
        resolveFn('done');

        await expect(p1).resolves.toBe('done');
        await expect(p2).resolves.toBe('done');

        expect(getPendingRequestCount()).toBe(0);
    });
});