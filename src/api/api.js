// src/api/api.js
import axios from 'axios';

// Constants
const BASE_URL = process.env.REACT_APP_API_URL;
const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL;

const publicRoutes = [
    '/products',
    '/products/best-selling',
    '/products/search',
    '/products/categories',
    '/settings',
    '/timer',
    '/promo-codes/validate',
    '/orders/guest',
    '/categories' // Added GET /categories as a public route
];

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(request => {
    // Only consider it a public route if it's both in the publicRoutes list AND a GET request
    // This allows public GET for categories but requires auth for POST/PUT/DELETE
    const isPublicRoute = publicRoutes.some(route => request.url.startsWith(route)) && 
                          request.method.toLowerCase() === 'get';
    
    if (!isPublicRoute) {
        const token = localStorage.getItem('token');
        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }
    }
    return request;
}, error => {
    return Promise.reject(error);
});

// Single Response Interceptor
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        const isPublicRoute = publicRoutes.some(route => error.config.url.startsWith(route)) && 
                             error.config.method.toLowerCase() === 'get';

        if (!error.response) {
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        // Only handle 401 for non-public routes
        if (error.response.status === 401 && !isPublicRoute) {
            localStorage.removeItem('token');
            // Only redirect if not on a public page
            if (!window.location.pathname.startsWith('/')) {
                window.location.href = '/login';
            }
            return Promise.reject(new Error('Session expired. Please login again.'));
        }

        return Promise.reject(error);
    }
);


const api = {
    // Auth Methods
    setAuthToken: (token) => {
        if (token) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axiosInstance.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    },

    register: async (userData) => {
        const response = await axiosInstance.post('/users/register', userData);
        if (response.data.token) {
            api.setAuthToken(response.data.token);
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await axiosInstance.post('/users/login', credentials);
        if (response.data.token) {
            api.setAuthToken(response.data.token);
        }
        return response.data;
    },

    logout: async () => {
        try {
            await axiosInstance.post('/users/logout');
        } finally {
            api.setAuthToken(null);
        }
    },

    // User Profile Methods
    getUserProfile: () => axiosInstance.get('/users/profile').then(res => res.data),
    updateProfile: (userData) => axiosInstance.put('/users/profile', userData).then(res => res.data),
    updatePassword: (currentPassword, newPassword) => 
        axiosInstance.post('/users/update-password', { currentPassword, newPassword }).then(res => res.data),
    deleteAccount: () => axiosInstance.delete('/users/account').then(res => res.data),

    // Product Methods
    getProducts: () => axiosInstance.get('/products').then(res => res.data),
    getProductById: (id) => axiosInstance.get(`/products/${id}`).then(res => res.data),
    getBestSelling: () => axiosInstance.get('/products/best-selling').then(res => res.data),
    
    // LEGACY getCategories from products endpoint - keeping for backward compatibility
    getProductCategories: () => axiosInstance.get('/products/categories').then(res => res.data),
    
    addProduct: (formData) => {
        // Log form data for debugging
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        return axiosInstance.post('/products/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },

    updateProduct: (id, formData) => {
        // Log form data for debugging
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        return axiosInstance.put(`/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },

    deleteProduct: (id) => axiosInstance.delete(`/products/${id}`).then(res => res.data),
    
    // Toggle product sold out status
    toggleProductSoldOut: (id, soldOut) => 
        axiosInstance.put(`/products/${id}/toggle-sold-out`, { soldOut }).then(res => res.data),
    
    // Promo Code Methods
    getPromoCodes: () => axiosInstance.get('/promo-codes').then(res => res.data),
    validatePromoCode: async (code, cartTotal) => {
        try {
            const response = await axiosInstance.post('/promo-codes/validate', {
                code,
                cartTotal
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw new Error(error.response.data.message || 'Invalid promo code');
            }
            throw new Error('Error validating promo code');
        }
    },
    createPromoCode: (promoData) => axiosInstance.post('/promo-codes', promoData).then(res => res.data),
    updatePromoCode: (id, promoData) => axiosInstance.put(`/promo-codes/${id}`, promoData).then(res => res.data),
    deletePromoCode: (id) => axiosInstance.delete(`/promo-codes/${id}`).then(res => res.data),

    // Order Methods
    getOrders: () => axiosInstance.get('/orders').then(res => res.data),
    getUserOrders: () => axiosInstance.get('/orders/my-orders').then(res => res.data),
    getOrder: (orderId) => axiosInstance.get(`/orders/${orderId}`).then(res => res.data),
    createOrder: (orderData) => axiosInstance.post('/orders', orderData).then(res => res.data),
    createGuestOrder: (orderData) => axiosInstance.post('/orders/guest', orderData).then(res => res.data),
    getGuestOrder: (orderId, email) => 
        axiosInstance.get(`/orders/guest/${orderId}?email=${email}`).then(res => res.data),
    updateOrderStatus: (orderId, status) => 
        axiosInstance.put(`/orders/${orderId}`, { status }).then(res => res.data),
    deleteOrder: (orderId) => axiosInstance.delete(`/orders/${orderId}`).then(res => res.data),
    cancelOrder: (orderId) => axiosInstance.put(`/orders/${orderId}/cancel`).then(res => res.data),

    // Address Methods
    getAddresses: () => axiosInstance.get('/users/addresses').then(res => res.data),
    addAddress: (addressData) => axiosInstance.post('/users/addresses', addressData).then(res => res.data),
    updateAddress: (addressId, addressData) => 
        axiosInstance.put(`/users/addresses/${addressId}`, addressData).then(res => res.data),
    deleteAddress: (addressId) => axiosInstance.delete(`/users/addresses/${addressId}`).then(res => res.data),
    setDefaultAddress: (addressId) => 
        axiosInstance.put(`/users/addresses/${addressId}/default`).then(res => res.data),

    // Wishlist Methods
    getUserWishlist: () => axiosInstance.get('/users/wishlist').then(res => res.data),
    addToWishlist: (productId) => 
        axiosInstance.post('/users/wishlist/add', { productId }).then(res => res.data),
    removeFromWishlist: (productId) => 
        axiosInstance.delete(`/users/wishlist/${productId}`).then(res => res.data),

    // Discount Methods
    applyDiscount: (discountData) => 
        axiosInstance.post('/products/discount', {
            type: discountData.type,
            discountType: discountData.discountType,
            value: parseFloat(discountData.value),
            targetId: discountData.targetId || null,
            category: discountData.category || null,
            discountEndDate: discountData.discountEndDate || null // Handle null value
        }).then(res => res.data),
        
    resetDiscount: (productId) => 
        axiosInstance.post('/products/reset-discount', { productId }).then(res => res.data),

    // Black Friday Methods
    getBlackFridayData: async () => {
        try {
            const response = await axiosInstance.get('/products/black-friday');
            return response.data;
        } catch (error) {
            console.error('Black Friday data error:', error);
            return { isActive: false };
        }
    },
    applyBlackFridayDiscount: (discountData) => 
        axiosInstance.post('/products/black-friday', discountData).then(res => res.data),
    // Timer Methods
    getTimer: () => axiosInstance.get('/timer').then(res => res.data),
    createTimer: (timerData) => axiosInstance.post('/timer', timerData).then(res => res.data),
    deleteTimer: (timerId) => axiosInstance.delete(`/timer/${timerId}`).then(res => res.data),

    // Settings Methods
    getSettings: () => axiosInstance.get('/settings').then(res => res.data),
    updateSettings: (settingsData) => axiosInstance.put('/settings', settingsData).then(res => res.data),
    updateHeroSettings: (formData) => 
        axiosInstance.put('/settings/hero', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data),
    // Admin Dashboard Methods
    getAllOrders: () => axiosInstance.get('/admin/orders').then(res => res.data),
    getDashboardStats: () => axiosInstance.get('/admin/dashboard/stats').then(res => res.data),

    // Review Methods
    getProductReviews: (productId) => 
        axiosInstance.get(`/products/${productId}/reviews`).then(res => res.data),
    addProductReview: (productId, reviewData) => 
        axiosInstance.post(`/products/${productId}/reviews`, reviewData).then(res => res.data),

    // Search Methods
    searchProducts: (query) => 
        axiosInstance.get(`/products/search?q=${encodeURIComponent(query)}`).then(res => res.data),
    
    // File Upload Methods
    uploadImage: (file, type = 'product') => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', type);
        return axiosInstance.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },
    
    getCategories: async () => {
        try {
          console.log('API: Fetching categories...');
          const response = await axiosInstance.get('/categories');
          console.log('API: Categories response:', response.data);
          return response.data;
        } catch (error) {
          console.error('Error fetching categories:', error);
          throw error;
        }
      },
    createCategory: async (name) => {
        try {
            const response = await axiosInstance.post('/categories', { name });
            return response.data;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },
    
    updateCategory: async (oldName, newName) => {
        try {
            const response = await axiosInstance.put(`/categories/${encodeURIComponent(oldName)}`, { newName });
            return response.data;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },
    
    deleteCategory: async (name) => {
        try {
          console.log(`API: Deleting category: ${name}`);
          const response = await axiosInstance.delete(`/categories/${encodeURIComponent(name)}`);
          return response.data;
        } catch (error) {
          console.error('Error deleting category:', error);
          throw error;
        }
      },
    
    mergeCategories: async (sourceCategory, targetCategory) => {
        try {
            const response = await axiosInstance.post('/categories/merge', { 
                sourceCategory, 
                targetCategory 
            });
            return response.data;
        } catch (error) {
            console.error('Error merging categories:', error);
            throw error;
        }
    },
    
    // User Preferences Methods
    updateUserPreferences: (preferences) => 
        axiosInstance.put('/users/preferences', preferences).then(res => res.data),

    // Utility Methods
    handleError: (error) => {
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        throw new Error(errorMessage);
    }
};

export default api;