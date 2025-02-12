// src/components/DiscountedProducts.js
import React, { useState, useEffect } from 'react';
import ProductCarousel from './ProductCarousel/ProductCarousel';
import api from '../api/api';

const DiscountedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getProducts();
        // Add debug logging
        console.log('API response:', response);
        
        const discountedProducts = response.filter(product => 
          product.discountPercentage > 0 && 
          product.discountEndDate && 
          new Date(product.discountEndDate) > new Date()
        );
        
        // Add debug logging
        console.log('Filtered discounted products:', discountedProducts);
        
        setProducts(discountedProducts);
      } catch (err) {
        console.error('Error fetching discounted products:', err);
        setError('Unable to load discounted products');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, []);

  return (
    <ProductCarousel 
      products={products}
      title="Special Offers"
      category="discounted"
      loading={loading}
    />
  );
};

export default DiscountedProducts;