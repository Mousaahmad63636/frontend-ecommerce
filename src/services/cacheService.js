// src/services/cacheService.js
class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    this.maxMemoryItems = 100;
  }

  // Memory Cache (fastest, but cleared on page refresh)
  setMemory(key, data, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    
    // Clean up if cache is getting too large
    if (this.memoryCache.size >= this.maxMemoryItems) {
      this.cleanupMemoryCache();
    }
    
    this.memoryCache.set(key, {
      data,
      expiry,
      timestamp: Date.now()
    });
  }

  getMemory(key) {
    const item = this.memoryCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return item.data;
  }

  // LocalStorage Cache (persists across sessions)
  setLocal(key, data, ttl = this.defaultTTL) {
    try {
      const item = {
        data,
        expiry: Date.now() + ttl,
        timestamp: Date.now(),
        version: this.getCacheVersion()
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('LocalStorage cache write failed:', error);
      // Fallback to memory cache
      this.setMemory(key, data, ttl);
    }
  }

  getLocal(key) {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      // Check version compatibility
      if (parsed.version !== this.getCacheVersion()) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      // Check expiry
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.warn('LocalStorage cache read failed:', error);
      return null;
    }
  }

  // Combined get method (checks memory first, then localStorage)
  get(key) {
    // Try memory cache first (fastest)
    let data = this.getMemory(key);
    if (data) return data;
    
    // Try localStorage cache
    data = this.getLocal(key);
    if (data) {
      // Store in memory for next time
      this.setMemory(key, data);
      return data;
    }
    
    return null;
  }

  // Combined set method
  set(key, data, options = {}) {
    const { 
      ttl = this.defaultTTL, 
      memoryOnly = false, 
      localOnly = false 
    } = options;
    
    if (!localOnly) {
      this.setMemory(key, data, ttl);
    }
    
    if (!memoryOnly) {
      this.setLocal(key, data, ttl);
    }
  }

  // Cache invalidation
  invalidate(key) {
    this.memoryCache.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  invalidatePattern(pattern) {
    // Invalidate memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Invalidate localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_') && key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    }
  }

  // Clear all cache
  clear() {
    this.memoryCache.clear();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    }
  }

  // Cleanup methods
  cleanupMemoryCache() {
    // Remove expired items first
    for (const [key, item] of this.memoryCache.entries()) {
      if (Date.now() > item.expiry) {
        this.memoryCache.delete(key);
      }
    }
    
    // If still too many items, remove oldest ones
    if (this.memoryCache.size >= this.maxMemoryItems) {
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.maxMemoryItems / 4));
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  cleanupLocalStorage() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (Date.now() > item.expiry || item.version !== this.getCacheVersion()) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Remove corrupted items
          localStorage.removeItem(key);
        }
      }
    }
  }

  // Cache version management
  getCacheVersion() {
    return process.env.REACT_APP_CACHE_VERSION || '1.0.0';
  }

  // Cache statistics
  getStats() {
    const memorySize = this.memoryCache.size;
    let localStorageSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        localStorageSize++;
      }
    }
    
    return {
      memoryItems: memorySize,
      localStorageItems: localStorageSize,
      memoryHitRate: this.memoryHitRate || 0,
      localStorageHitRate: this.localStorageHitRate || 0
    };
  }

  // Preload data into cache
  async preload(key, fetchFunction, options = {}) {
    const cached = this.get(key);
    if (cached) return cached;
    
    try {
      const data = await fetchFunction();
      this.set(key, data, options);
      return data;
    } catch (error) {
      console.error(`Cache preload failed for ${key}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Cleanup on page load
cacheService.cleanupLocalStorage();

// Periodic cleanup (every 10 minutes)
setInterval(() => {
  cacheService.cleanupMemoryCache();
  cacheService.cleanupLocalStorage();
}, 10 * 60 * 1000);

export default cacheService;
