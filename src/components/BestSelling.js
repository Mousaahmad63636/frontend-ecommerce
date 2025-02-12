// src/components/BestSelling.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductItem from './ProductItem';
import api from '../api/api';
import './ProductCarousel.css';

const BestSelling = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = window.innerWidth < 768 ? 1 : 4;

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

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      Math.min(prevIndex + itemsPerPage, products.length - itemsPerPage)
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - itemsPerPage, 0));
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
    <div className="product-carousel-section container">
      <div className="section-header">
        <h2>Best Selling Products</h2>
        <Link to="/?category=best-selling" className="btn btn-link">
          Show All <i className="fas fa-arrow-right"></i>
        </Link>
      </div>

      <div className="product-carousel-container">
        <button 
          className="carousel-arrow prev"
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        <div className="product-carousel">
          <div 
            className="product-carousel-track"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              gridTemplateColumns: `repeat(${products.length}, ${100 / itemsPerPage}%)`
            }}
          >
            {products.map((product) => (
              <div key={product._id} className="carousel-item">
                <ProductItem product={product} />
              </div>
            ))}
          </div>
        </div>

        <button 
          className="carousel-arrow next"
          onClick={nextSlide}
          disabled={currentIndex >= products.length - itemsPerPage}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default BestSelling;