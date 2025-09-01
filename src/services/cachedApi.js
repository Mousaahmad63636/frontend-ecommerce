// src/services/cachedApi.js
import api from '../api/api';
import cacheService from './cacheService';

// Cache TTL configurations (in milliseconds)
const CACHE_TTL = {
  PRODUCTS: 10 * 60 * 1000,        // 10 minutes - products change less frequently
  PRODUCT_DETAIL: 15 * 60 * 1000,  // 15 minutes - individual products
  CATEGORIES: 30 * 60 * 1000,      // 30 minutes - categories rarely change
  SETTINGS: 60 * 60 * 1000,        // 1 hour - settings change rarely
  USER_PROFILE: 5 * 60 * 1000,     // 5 minutes - user data
  WISHLIST: 2 * 60 * 1000,         // 2 minutes - wishlist changes often
  ORDERS: 1 * 60 * 1000,           // 1 minute - orders change frequently
  SEARCH: 5 * 60 * 1000,           // 5 minutes - search results
};

class CachedApi {
  constructor() {
    this.cache = cacheService;
  }

  // Helper method to generate cache keys
  generateKey(method, params = '') {
    return `api_${method}_${params}`;
  }

  // Generic cached fetch method
  async cachedFetch(cacheKey, fetchFunction, ttl, options = {}) {
    const { 
      forceRefresh = false, 
      memoryOnly = false,
      skipCache = false 
    } = options;

    // Skip cache if requested
    if (skipCache) {
      return await fetchFunction();
    }

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`Cache hit: ${cacheKey}`);
        return cached;
      }
    }

    try {
      console.log(`Cache miss: ${cacheKey} - Fetching fresh data`);
      const data = await fetchFunction();
      
      // Cache the result
      this.cache.set(cacheKey, data, { 
        ttl, 
        memoryOnly 
      });
      
      return data;
    } catch (error) {
      // If fetch fails, try to return stale cache data
      const staleData = this.cache.get(cacheKey);
      if (staleData) {
        console.warn(`API fetch failed, returning stale cache: ${cacheKey}`);
        return staleData;
      }
      throw error;
    }
  }

  // Products API with caching
  async getProducts(options = {}) {
    const cacheKey = this.generateKey('products');
    return this.cachedFetch(
      cacheKey,
      () => api.getProducts(),
      CACHE_TTL.PRODUCTS,
      options
    );
  }

  async getProductById(id, options = {}) {
    const cacheKey = this.generateKey('product', id);
    return this.cachedFetch(
      cacheKey,
      () => api.getProductById(id),
      CACHE_TTL.PRODUCT_DETAIL,
      options
    );
  }

  async getBestSelling(options = {}) {
    const cacheKey = this.generateKey('best_selling');
    return this.cachedFetch(
      cacheKey,
      () => api.getBestSelling(),
      CACHE_TTL.PRODUCTS,
      options
    );
  }

  async searchProducts(query, options = {}) {
    const cacheKey = this.generateKey('search', encodeURIComponent(query));
    return this.cachedFetch(
      cacheKey,
      () => api.searchProducts(query),
      CACHE_TTL.SEARCH,
      options
    );
  }

  // Categories API with caching
  async getCategories(options = {}) {
    const cacheKey = this.generateKey('categories');
    return this.cachedFetch(
      cacheKey,
      () => api.getCategories(),
      CACHE_TTL.CATEGORIES,
      options
    );
  }

  async getProductCategories(options = {}) {
    const cacheKey = this.generateKey('product_categories');
    return this.cachedFetch(
      cacheKey,
      () => api.getProductCategories(),
      CACHE_TTL.CATEGORIES,
      options
    );
  }

  // Settings API with caching
  async getSettings(options = {}) {
    const cacheKey = this.generateKey('settings');
    return this.cachedFetch(
      cacheKey,
      () => api.getSettings(),
      CACHE_TTL.SETTINGS,
      options
    );
  }

  async getTimer(options = {}) {
    const cacheKey = this.generateKey('timer');
    return this.cachedFetch(
      cacheKey,
      () => api.getTimer(),
      CACHE_TTL.SETTINGS,
      options
    );
  }

  async getBlackFridayData(options = {}) {
    const cacheKey = this.generateKey('black_friday');
    return this.cachedFetch(
      cacheKey,
      () => api.getBlackFridayData(),
      CACHE_TTL.SETTINGS,
      options
    );
  }

  // User-specific APIs with shorter cache times
  async getUserProfile(options = {}) {
    const cacheKey = this.generateKey('user_profile');
    return this.cachedFetch(
      cacheKey,
      () => api.getUserProfile(),
      CACHE_TTL.USER_PROFILE,
      { ...options, memoryOnly: true } // User data in memory only for privacy
    );
  }

  async getUserWishlist(options = {}) {
    const cacheKey = this.generateKey('user_wishlist');
    return this.cachedFetch(
      cacheKey,
      () => api.getUserWishlist(),
      CACHE_TTL.WISHLIST,
      { ...options, memoryOnly: true }
    );
  }

  async getUserOrders(options = {}) {
    const cacheKey = this.generateKey('user_orders');
    return this.cachedFetch(
      cacheKey,
      () => api.getUserOrders(),
      CACHE_TTL.ORDERS,
      { ...options, memoryOnly: true }
    );
  }

  async getAddresses(options = {}) {
    const cacheKey = this.generateKey('user_addresses');
    return this.cachedFetch(
      cacheKey,
      () => api.getAddresses(),
      CACHE_TTL.USER_PROFILE,
      { ...options, memoryOnly: true }
    );
  }

  // Promo codes
  async getPromoCodes(options = {}) {
    const cacheKey = this.generateKey('promo_codes');
    return this.cachedFetch(
      cacheKey,
      () => api.getPromoCodes(),
      CACHE_TTL.SETTINGS,
      options
    );
  }

  async validatePromoCode(code, cartTotal, options = {}) {
    // Don't cache promo validation as it may have usage limits
    return api.validatePromoCode(code, cartTotal);
  }

  // Cache invalidation methods
  invalidateProducts() {
    this.cache.invalidatePattern('products');
    this.cache.invalidatePattern('best_selling');
    this.cache.invalidatePattern('search');
  }

  invalidateProduct(id) {
    this.cache.invalidate(this.generateKey('product', id));
    // Also invalidate products list as it may contain this product
    this.invalidateProducts();
  }

  invalidateCategories() {
    this.cache.invalidatePattern('categories');
  }

  invalidateUserData() {
    this.cache.invalidatePattern('user_');
  }

  invalidateSettings() {
    this.cache.invalidatePattern('settings');
    this.cache.invalidatePattern('timer');
    this.cache.invalidatePattern('black_friday');
  }

  // Preload critical data
  async preloadCriticalData() {
    try {
      console.log('Preloading critical data...');
      
      // Preload in parallel
      const promises = [
        this.getProducts({ memoryOnly: true }),
        this.getCategories({ memoryOnly: true }),
        this.getSettings({ memoryOnly: true }),
      ];

      await Promise.allSettled(promises);
      console.log('Critical data preloaded');
    } catch (error) {
      console.error('Error preloading critical data:', error);
    }
  }

  // Get cache statistics
  getCacheStats() {
    return this.cache.getStats();
  }

  // Clear all cache
  clearCache() {
    this.cache.clear();
  }

  // Pass-through methods for APIs that shouldn't be cached
  
  // Auth methods (never cache)
  login = api.login.bind(api);
  register = api.register.bind(api);
  logout = api.logout.bind(api);
  
  // Order creation (never cache)
  createOrder = api.createOrder.bind(api);
  createGuestOrder = api.createGuestOrder.bind(api);
  
  // Data modification methods (invalidate cache after success)
  async addProduct(formData) {
    const result = await api.addProduct(formData);
    this.invalidateProducts();
    return result;
  }

  async updateProduct(id, formData) {
    const result = await api.updateProduct(id, formData);
    this.invalidateProduct(id);
    return result;
  }

  async deleteProduct(id) {
    const result = await api.deleteProduct(id);
    this.invalidateProduct(id);
    return result;
  }

  async toggleProductSoldOut(id, soldOut) {
    const result = await api.toggleProductSoldOut(id, soldOut);
    this.invalidateProduct(id);
    return result;
  }

  async addToWishlist(productId) {
    const result = await api.addToWishlist(productId);
    this.cache.invalidate(this.generateKey('user_wishlist'));
    return result;
  }

  async removeFromWishlist(productId) {
    const result = await api.removeFromWishlist(productId);
    this.cache.invalidate(this.generateKey('user_wishlist'));
    return result;
  }

  async updateProfile(userData) {
    const result = await api.updateProfile(userData);
    this.cache.invalidate(this.generateKey('user_profile'));
    return result;
  }

  async addAddress(addressData) {
    const result = await api.addAddress(addressData);
    this.cache.invalidate(this.generateKey('user_addresses'));
    return result;
  }

  async updateAddress(addressId, addressData) {
    const result = await api.updateAddress(addressId, addressData);
    this.cache.invalidate(this.generateKey('user_addresses'));
    return result;
  }

  async deleteAddress(addressId) {
    const result = await api.deleteAddress(addressId);
    this.cache.invalidate(this.generateKey('user_addresses'));
    return result;
  }

  async setDefaultAddress(addressId) {
    const result = await api.setDefaultAddress(addressId);
    this.cache.invalidate(this.generateKey('user_addresses'));
    return result;
  }

  async updateSettings(settingsData) {
    const result = await api.updateSettings(settingsData);
    this.invalidateSettings();
    return result;
  }

  async updateHeroSettings(formData) {
    const result = await api.updateHeroSettings(formData);
    this.invalidateSettings();
    return result;
  }

  // Category management with cache invalidation
  async createCategory(name) {
    const result = await api.createCategory(name);
    this.invalidateCategories();
    return result;
  }

  async updateCategory(oldName, newName) {
    const result = await api.updateCategory(oldName, newName);
    this.invalidateCategories();
    this.invalidateProducts(); // Products may reference categories
    return result;
  }

  async deleteCategory(name) {
    const result = await api.deleteCategory(name);
    this.invalidateCategories();
    this.invalidateProducts();
    return result;
  }

  async mergeCategories(sourceCategory, targetCategory) {
    const result = await api.mergeCategories(sourceCategory, targetCategory);
    this.invalidateCategories();
    this.invalidateProducts();
    return result;
  }
}

// Create singleton instance
const cachedApi = new CachedApi();

// Preload critical data on app start
if (typeof window !== 'undefined') {
  // Small delay to let the app initialize
  setTimeout(() => {
    cachedApi.preloadCriticalData();
  }, 1000);
}

export default cachedApi;
