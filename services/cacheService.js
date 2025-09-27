const NodeCache = require("node-cache");

// Create a new cache instance with default TTL (Time To Live) of 5 minutes
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

/**
 * Cache Service - Handles in-memory caching for API responses
 * This improves performance by storing frequently accessed data in memory
 */

// Get value from cache by key
const get = (key) => {
  return cache.get(key);
};

// Set value in cache with optional TTL
const set = (key, value, ttl = 300) => {
  return cache.set(key, value, ttl);
};

// Delete specific key from cache
const del = (key) => {
  return cache.del(key);
};

// Clear all cache entries
const flush = () => {
  return cache.flushAll();
};

module.exports = {
  get,
  set,
  del,
  flush,
};
