// src/api/api.js
import axios from 'axios';

// Constants
const BASE_URL = process.env.REACT_APP_API_URL;
const UPLOAD_URL = process.env.REACT_APP_UPLOAD_URL;

// Create axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Single Request Interceptor
axiosInstance.interceptors.request.use(request => {
    const token = localStorage.getItem('token');
    if (token) {
        request.headers.Authorization = `Bearer ${token}`; // Ensure this line is executed
    }
    console.log('Request:', request);
    return request;
}, error => {
    return Promise.reject(error);
});

// Single Response Interceptor
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        // Handle network errors
        if (!error.response) {
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        // Handle expired token
        if (error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(new Error('Session expired. Please login again.'));
        }

        console.error('Response Error:', error.response?.data);
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
    
    addProduct: (formData) => 
        axiosInstance.post('/products/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data),

    updateProduct: (id, formData) => 
        axiosInstance.put(`/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data),

    deleteProduct: (id) => axiosInstance.delete(`/products/${id}`).then(res => res.data),
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
        axiosInstance.post('/products/discount', discountData).then(res => res.data),
    resetDiscount: (productId = null) => 
        axiosInstance.post('/products/reset-discount', { productId }).then(res => res.data),
    toggleProductSoldOut: (productId, soldOut) => 
        axiosInstance.put(`/products/${productId}/toggle-sold-out`, {
            soldOut: Boolean(soldOut)
        }).then(res => res.data),

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

    // Search and Categories Methods
    searchProducts: (query) => 
        axiosInstance.get(`/products/search?q=${encodeURIComponent(query)}`).then(res => res.data),
    getCategories: () => axiosInstance.get('/products/categories').then(res => res.data),

    // File Upload Methods
    uploadImage: (file, type = 'product') => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', type);
        return axiosInstance.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
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