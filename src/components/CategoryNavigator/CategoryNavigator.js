import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './CategoryNavigator.css';
import React, { useState, useEffect, useRef } from 'react';

function CategoryNavigator({ hideArrows = false }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const currentCategory = queryParams.get('category') || 'All Products';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log("CategoryNavigator: Fetching categories...");
        
        // Try the dedicated categories endpoint first
        try {
          const response = await api.getCategories();
          if (response && response.categories) {
            console.log("CategoryNavigator: Categories loaded:", response.categories);
            setCategories(response.categories);
            return; // Exit if successful
          }
        } catch (err) {
          console.warn("CategoryNavigator: Failed to load from categories endpoint, trying fallback...");
        }
        
        // Fallback: extract categories from products
        const products = await api.getProducts();
        console.log("CategoryNavigator: Products loaded:", products.length);
        
        const allCategories = new Set();
        
        products.forEach(product => {
          // Add primary category
          if (product.category) {
            allCategories.add(product.category);
          }
          
          // Add categories from the categories array
          if (Array.isArray(product.categories)) {
            product.categories.forEach(cat => {
              if (cat) allCategories.add(cat);
            });
          }
        });
        
        const categoriesList = [...allCategories].sort();
        console.log("CategoryNavigator: Extracted categories:", categoriesList);
        setCategories(categoriesList);
      } catch (error) {
        console.error('CategoryNavigator: Error fetching categories:', error);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    if (category === 'All Products') {
      navigate('/');
    } else {
      navigate(`/?category=${encodeURIComponent(category)}`);
    }
  };

  // Scroll navigation with buttons
  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 300;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Always render a placeholder during loading
  if (loading) {
    return (
      <div className="category-navigator-placeholder" style={{height: '50px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb'}}>
        <div className="container mx-auto px-4 flex items-center justify-center h-full">
          <span className="text-gray-400">Loading categories...</span>
        </div>
      </div>
    );
  }

  // Show a message if there's an error
  if (error) {
    return (
      <div className="category-navigator-placeholder" style={{height: '50px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb'}}>
        <div className="container mx-auto px-4 flex items-center justify-center h-full">
          <span className="text-red-500">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <nav className="category-navigator">
      {/* Left scroll button - Only render if hideArrows is false */}
      {!hideArrows && (
        <div className="scroll-button left" onClick={() => scroll('left')}>
          <i className="fas fa-chevron-left"></i>
        </div>
      )}
      
      <div className={`container ${hideArrows ? 'no-scroll-buttons' : ''}`} ref={containerRef}>
        <ul className="category-list">
          <li className={`category-item ${currentCategory === 'All Products' ? 'active' : ''}`}>
            <button 
              onClick={() => handleCategoryClick('All Products')}
              className="category-link"
            >
              All Products
            </button>
          </li>
          {categories.map(category => (
            <li 
              key={category} 
              className={`category-item ${currentCategory === category ? 'active' : ''}`}
            >
              <button
                onClick={() => handleCategoryClick(category)}
                className="category-link"
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Right scroll button - Only render if hideArrows is false */}
      {!hideArrows && (
        <div className="scroll-button right" onClick={() => scroll('right')}>
          <i className="fas fa-chevron-right"></i>
        </div>
      )}
    </nav>
  );
}

export default CategoryNavigator;