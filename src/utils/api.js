import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Products
  getProducts: async () => {
    const response = await axios.get(`${BASE_URL}/products`);
    return response.data;
  },

  getProductById: async (id) => {
    const response = await axios.get(`${BASE_URL}/products/${id}`);
    return response.data;
  },

  getBestSelling: async () => {
    const response = await axios.get(`${BASE_URL}/products/best-selling`);
    return response.data;
  },

  addProduct: async (productData) => {
    const response = await axios.post(`${BASE_URL}/products/add`, productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await axios.post(`${BASE_URL}/products/update/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await axios.delete(`${BASE_URL}/products/${id}`);
    return response.data;
  },

  applyDiscount: async (discountData) => {
    const response = await axios.post(`${BASE_URL}/products/discount`, discountData);
    return response.data;
  },

  resetDiscount: async (productId) => {
    const response = await axios.post(`${BASE_URL}/products/reset-discount`, { productId });
    return response.data;
  },

  // Orders
  getOrders: async () => {
    const response = await axios.get(`${BASE_URL}/orders`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await axios.post(`${BASE_URL}/orders`, orderData);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await axios.put(`${BASE_URL}/orders/${id}`, { status });
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await axios.delete(`${BASE_URL}/orders/${id}`);
    return response.data;
  }
};