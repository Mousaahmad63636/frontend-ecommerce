import React, { useState, useEffect, useRef } from 'react';
import ProductItem from './ProductItem';
import { HorizontalScrollSection, ScrollControls } from '../styles/ProductListStyles';
import api from '../api/api';

const BestSelling = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);

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

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 300; // Adjust this value based on your needs
      const newScrollPosition = container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !products || products.length === 0) {
    return null;
  }

  return (
    <div className="container my-4">
      <h2 className="mb-4">Best Selling Products</h2>
      <ScrollControls>
        <button 
          className="scroll-button prev" 
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button 
          className="scroll-button next" 
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
        <HorizontalScrollSection ref={scrollContainerRef}>
          {products.map(product => (
            <ProductItem key={product._id} product={product} />
          ))}
        </HorizontalScrollSection>
      </ScrollControls>
    </div>
  );
};

export default BestSelling;