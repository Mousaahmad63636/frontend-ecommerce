// src/components/BestSelling.js
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

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Hide the section completely if there's an error
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Best Selling Products</h2>
      <ProductList products={products} />
    </div>
  );
};

export default BestSelling;