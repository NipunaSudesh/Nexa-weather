const cache = new Map();

/**
 * Get cached data
 */
export function getCache(key) {
  const entry = cache.get(key);

  if (!entry) {
    return {
      hit: false,
      data: null,
    };
  }

  const isExpired = Date.now() > entry.expiresAt;

  if (isExpired) {
    cache.delete(key);

    return {
      hit: false,
      data: null,
    };
  }

  return {
    hit: true,
    data: entry.data,
  };
}

/**
 * Store data in cache
 */
export function setCache(key, data, ttlMs) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
    cachedAt: Date.now(),
  });
}

/**
 * Remove one cache entry
 */
export function clearCache(key) {
  cache.delete(key);
}

/**
 * Remove all cache entries
 *
 * Used when cities are added/removed because
 * the weather result depends on the city list.
 */
export function clearAllCache() {
  cache.clear();
}

/**
 * Get cache information
 */
export function getCacheStatus() {
  const status = [];
  const now = Date.now();

  for (const [key, entry] of cache.entries()) {
    status.push({
      key,
      status: now > entry.expiresAt ? "EXPIRED" : "HIT",
      cachedAt: new Date(entry.cachedAt).toISOString(),
      expiresAt: new Date(entry.expiresAt).toISOString(),
      ttlRemainingMs: Math.max(
        0,
        entry.expiresAt - now
      ),
    });
  }

  return status;
}

/**
 * Cache TTL configuration
 */
export const CACHE_TTL = {
  RAW_WEATHER: 5 * 60 * 1000,
  PROCESSED_OUTPUT: 5 * 60 * 1000,
};