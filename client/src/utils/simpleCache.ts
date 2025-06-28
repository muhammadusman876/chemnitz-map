// utils/simpleCache.ts
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

export const simpleCache = {
  set(key: string, data: any, duration = CACHE_DURATION) {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      duration,
    });
    `💾 Cache SET: ${key} (${
      Array.isArray(data) ? data.length + " items" : typeof data
    }) - ${Math.round(duration / 1000 / 60)}min`;
  },

  get(key: string) {
    const item = cache.get(key);
    if (!item) {
      `❌ Cache MISS: ${key}`;
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.duration) {
      cache.delete(key);
      `⏰ Cache EXPIRED: ${key}`;
      return null;
    }

    `✅ Cache HIT: ${key}`;
    return item.data;
  },

  clear(pattern?: string) {
    if (pattern) {
      // Clear specific pattern
      const keys = Array.from(cache.keys());
      const matchedKeys = keys.filter((key) => key.includes(pattern));
      matchedKeys.forEach((key) => cache.delete(key));
      `🗑️ Cache CLEARED (pattern: ${pattern}): ${matchedKeys.length} items removed`;
    } else {
      // Clear all
      const keys = Array.from(cache.keys());
      cache.clear();
      `🗑️ Cache CLEARED: ${keys.length} items removed`;
    }
  },

  // Debug method to see what's in cache
  debug() {
    ("📊 Cache Status:");
    if (cache.size === 0) {
      ("  Cache is empty");
      return;
    }

    cache.forEach((value, key) => {
      const age = Date.now() - value.timestamp;
      const remaining = value.duration - age;
      const status =
        remaining > 0
          ? `${Math.round(remaining / 1000)}s remaining`
          : "EXPIRED";
      const size = Array.isArray(value.data)
        ? `${value.data.length} items`
        : typeof value.data;
      `  ${key}: ${status} (${size})`;
    });
  },

  // Get cache stats
  stats() {
    const total = cache.size;
    let expired = 0;
    let active = 0;

    cache.forEach((value) => {
      const age = Date.now() - value.timestamp;
      if (age > value.duration) {
        expired++;
      } else {
        active++;
      }
    });

    return { total, active, expired };
  },

  // Manually clean up expired entries
  cleanup() {
    const before = cache.size;
    cache.forEach((value, key) => {
      const age = Date.now() - value.timestamp;
      if (age > value.duration) {
        cache.delete(key);
      }
    });
    const after = cache.size;
    `🧹 Cache CLEANUP: Removed ${before - after} expired entries`;
  },
};
