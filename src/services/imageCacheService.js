// src/services/imageCacheService.js
import { getImageUrl } from '../utils/imageUtils';

class ImageCacheService {
  constructor() {
    this.imageCache = new Map();
    this.loadingPromises = new Map();
    this.preloadQueue = [];
    this.isProcessingQueue = false;
    this.maxCacheSize = 200;
    this.batchSize = 5;
  }

  // Preload a single image
  async preloadImage(imageUrl, priority = 'normal') {
    if (!imageUrl) return null;

    const fullUrl = getImageUrl(imageUrl);
    const cacheKey = this.getCacheKey(fullUrl);

    // Return cached image if available
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey);
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Create loading promise
    const loadPromise = this.loadImage(fullUrl, cacheKey);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const result = await loadPromise;
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  // Load image and cache it
  async loadImage(url, cacheKey) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Clean cache if getting too large
        if (this.imageCache.size >= this.maxCacheSize) {
          this.cleanupCache();
        }

        // Cache the loaded image
        this.imageCache.set(cacheKey, {
          url,
          element: img,
          timestamp: Date.now(),
          width: img.naturalWidth,
          height: img.naturalHeight
        });

        console.log(`Image cached: ${url}`);
        resolve(img);
      };

      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        reject(new Error(`Failed to load image: ${url}`));
      };

      // Set loading attributes for better performance
      img.loading = 'eager';
      img.decoding = 'async';
      img.src = url;
    });
  }

  // Preload multiple images with batching
  async preloadImages(imageUrls, priority = 'normal') {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return [];
    }

    const validUrls = imageUrls.filter(url => url && typeof url === 'string');
    
    // Add to preload queue
    validUrls.forEach(url => {
      this.preloadQueue.push({ url, priority });
    });

    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processPreloadQueue();
    }

    // Return promises for immediate images
    const immediatePromises = validUrls.slice(0, this.batchSize).map(url => 
      this.preloadImage(url, priority).catch(err => {
        console.warn(`Image preload failed: ${url}`, err);
        return null;
      })
    );

    return Promise.allSettled(immediatePromises);
  }

  // Process preload queue in batches
  async processPreloadQueue() {
    if (this.isProcessingQueue || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, this.batchSize);
      
      const promises = batch.map(({ url, priority }) => 
        this.preloadImage(url, priority).catch(err => {
          console.warn(`Batch image preload failed: ${url}`, err);
          return null;
        })
      );

      await Promise.allSettled(promises);
      
      // Small delay between batches to avoid overwhelming the browser
      if (this.preloadQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.isProcessingQueue = false;
  }

  // Preload product images intelligently
  async preloadProductImages(products, options = {}) {
    const {
      preloadThumbnails = true,
      preloadFullImages = false,
      maxImages = 20,
      priority = 'normal'
    } = options;

    if (!Array.isArray(products)) return;

    const imageUrls = [];

    products.slice(0, maxImages).forEach(product => {
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((image, index) => {
          if (preloadThumbnails) {
            // Add thumbnail version
            const thumbnailUrl = this.getThumbnailUrl(image);
            imageUrls.push(thumbnailUrl);
          }
          
          if (preloadFullImages && index === 0) {
            // Add full-size version for first image only
            imageUrls.push(getImageUrl(image));
          }
        });
      }
    });

    return this.preloadImages(imageUrls, priority);
  }

  // Get thumbnail URL with size parameters
  getThumbnailUrl(imageUrl, size = '300x300') {
    const fullUrl = getImageUrl(imageUrl);
    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}size=${size}`;
  }

  // Preload hero and banner images
  async preloadHeroImages(heroSettings) {
    if (!heroSettings || !heroSettings.mediaUrl) return;

    const imageUrls = [heroSettings.mediaUrl];
    
    // If it's a video, preload the poster/thumbnail
    if (heroSettings.type === 'video' && heroSettings.posterUrl) {
      imageUrls.push(heroSettings.posterUrl);
    }

    return this.preloadImages(imageUrls, 'high');
  }

  // Smart preloading based on user behavior
  async smartPreload(context, data) {
    switch (context) {
      case 'homepage':
        // Preload hero images and first few product images
        if (data.heroSettings) {
          await this.preloadHeroImages(data.heroSettings);
        }
        if (data.products) {
          await this.preloadProductImages(data.products, {
            preloadThumbnails: true,
            maxImages: 12,
            priority: 'high'
          });
        }
        break;

      case 'product-detail':
        // Preload all images for the current product
        if (data.product && data.product.images) {
          const imageUrls = data.product.images.map(img => getImageUrl(img));
          await this.preloadImages(imageUrls, 'high');
        }
        
        // Preload thumbnails for similar products
        if (data.similarProducts) {
          await this.preloadProductImages(data.similarProducts, {
            preloadThumbnails: true,
            maxImages: 8,
            priority: 'normal'
          });
        }
        break;

      case 'category':
        // Preload category product thumbnails
        if (data.products) {
          await this.preloadProductImages(data.products, {
            preloadThumbnails: true,
            maxImages: 16,
            priority: 'normal'
          });
        }
        break;

      case 'search':
        // Preload search result thumbnails
        if (data.searchResults) {
          await this.preloadProductImages(data.searchResults, {
            preloadThumbnails: true,
            maxImages: 10,
            priority: 'normal'
          });
        }
        break;
    }
  }

  // Check if image is cached
  isCached(imageUrl) {
    const fullUrl = getImageUrl(imageUrl);
    const cacheKey = this.getCacheKey(fullUrl);
    return this.imageCache.has(cacheKey);
  }

  // Get cached image
  getCached(imageUrl) {
    const fullUrl = getImageUrl(imageUrl);
    const cacheKey = this.getCacheKey(fullUrl);
    return this.imageCache.get(cacheKey);
  }

  // Generate cache key from URL
  getCacheKey(url) {
    // Remove query parameters for consistent caching
    return url.split('?')[0];
  }

  // Cleanup old cached images
  cleanupCache() {
    const entries = Array.from(this.imageCache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of images
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.imageCache.delete(entries[i][0]);
    }
    
    console.log(`Image cache cleanup: removed ${toRemove} images`);
  }

  // Clear all cached images
  clearCache() {
    this.imageCache.clear();
    this.loadingPromises.clear();
    this.preloadQueue = [];
    console.log('Image cache cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cachedImages: this.imageCache.size,
      loadingImages: this.loadingPromises.size,
      queuedImages: this.preloadQueue.length,
      isProcessingQueue: this.isProcessingQueue
    };
  }

  // Prefetch images on hover (for better UX)
  setupHoverPreloading() {
    if (typeof document === 'undefined') return;

    document.addEventListener('mouseover', (event) => {
      const img = event.target.closest('img[data-preload]');
      if (img && img.dataset.preload) {
        this.preloadImage(img.dataset.preload, 'low');
      }
    });
  }
}

// Create singleton instance
const imageCacheService = new ImageCacheService();

// Setup hover preloading
if (typeof window !== 'undefined') {
  imageCacheService.setupHoverPreloading();
}

export default imageCacheService;
