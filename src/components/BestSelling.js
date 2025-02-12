// src/components/BestSelling.js
import React, { useState, useEffect } from 'react';
import ProductCarousel from './ProductCarousel/ProductCarousel';
import api from '../api/api';

const BestSelling = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getBestSelling();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching best-selling products:', err);
        setError('Unable to load best-selling products');
      } finally {
        setLoading(false);
      }
    };

    fetchBestSelling();
  }, []);

  if (error) {
    return null;
  }

  return (
    <div className="container my-4">
      <ProductCarousel 
        products={products}
        title="Best Selling Products"
        category="best-selling"
        loading={loading}
      />
    </div>
  );
};

export default BestSelling;