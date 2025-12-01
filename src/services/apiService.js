// src/services/apiService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 (Unauthorized) globally
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/'; // Redirect to home page
      return Promise.reject(new Error('Please login to continue'));
    }

    // Handle 400 (Bad Request)
    if (error.response?.status === 400) {
      return Promise.reject(new Error(error.response.data.message || 'Invalid request'));
    }

    // Handle 500 (Server Error)
    if (error.response?.status === 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);

const apiService = {
  // Products
  async getProducts() {
    try {
      const response = await axiosInstance.get('/products');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProductById(id) {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createProduct(productData) {
    try {
      const response = await axiosInstance.post('/products/add', productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateProduct(id, productData) {
    try {
      const response = await axiosInstance.post(`/products/update/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      const response = await axiosInstance.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async applyDiscount(discountData) {
    try {
      const response = await axiosInstance.post('/products/discount', discountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Orders
  async getOrders() {
    try {
      const response = await axiosInstance.get('/orders');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createOrder(orderData) {
    try {
      const response = await axiosInstance.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const response = await axiosInstance.put(`/orders/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Analytics
  async getBestSellingProducts() {
    try {
      const response = await axiosInstance.get('/products/best-selling');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default apiService;