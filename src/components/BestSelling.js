// components/BestSelling.js
import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';
import api from '../api/api';

const BestSelling = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        setLoading(true);
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

  return (
    <ProductList
      title="Best Selling Products"
      products={products}
      loading={loading}
      error={error}
      scrollable={true}
    />
  );
};

export default BestSelling;