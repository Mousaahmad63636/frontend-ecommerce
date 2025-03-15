import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './CategoryNavigator.css';
import React, { useState, useEffect, useRef } from 'react';

function CategoryNavigator() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const currentCategory = queryParams.get('category') || 'All Products';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Use the dedicated categories endpoint
        const response = await api.getCategories();
        if (response && response.categories) {
          setCategories(response.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to extracting categories from products
        try {
          const products = await api.getProducts();
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
          
          setCategories([...allCategories].sort());
        } catch (fallbackError) {
          console.error('Error fetching categories via fallback:', fallbackError);
        }
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

  if (loading) {
    return <div className="category-navigator-placeholder"></div>;
  }

  return (
    <nav className="category-navigator">
      <div className="scroll-button left" onClick={() => scroll('left')}>
        <i className="fas fa-chevron-left"></i>
      </div>
      
      <div className="container" ref={containerRef}>
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
      
      <div className="scroll-button right" onClick={() => scroll('right')}>
        <i className="fas fa-chevron-right"></i>
      </div>
    </nav>
  );
}

export default CategoryNavigator;