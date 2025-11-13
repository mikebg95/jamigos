/**
 * Request deduplication utility
 * Prevents duplicate identical requests from being made simultaneously
 */

// Cache of ongoing requests
const pendingRequests = new Map();

/**
 * Generate a unique key for a request
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @returns {string} Unique request key
 */
function getRequestKey(url, options = {}) {
  const method = options.method || 'GET';
  const body = options.body || '';
  return `${method}:${url}:${body}`;
}

/**
 * Execute a request with deduplication
 * If an identical request is already in flight, return the same promise
 *
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {function} fetchFn - Function that executes the actual request
 * @returns {Promise} Request promise
 */
export async function deduplicateRequest(url, options, fetchFn) {
  const key = getRequestKey(url, options);

  // If request is already pending, return existing promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // Execute the request
  const promise = fetchFn()
    .finally(() => {
      // Remove from cache when complete (success or error)
      pendingRequests.delete(key);
    });

  // Cache the promise
  pendingRequests.set(key, promise);

  return promise;
}

/**
 * Clear all pending requests from cache
 * Useful for cleanup or testing
 */
export function clearRequestCache() {
  pendingRequests.clear();
}

/**
 * Get the number of pending requests
 * Useful for debugging
 */
export function getPendingRequestCount() {
  return pendingRequests.size;
}
