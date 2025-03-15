import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import './CategoryNavigator.css';
import React, { useState, useEffect, useRef } from 'react';

function CategoryNavigator() {
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

  console.log("CategoryNavigator rendering with categories:", categories.length);

  // Instead of conditional rendering, always render the component
  // but with different content based on loading/error state
  return (
    <nav className="category-navigator" 
         style={{
           display: 'flex',
           height: '50px',
           background: 'white',
           borderBottom: '1px solid #e5e7eb',
           position: 'relative',
           width: '100%',
           zIndex: 25
         }}>
      {loading ? (
        <div className="flex items-center justify-center w-full">
          <span className="text-gray-400">Loading categories...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full">
          <span className="text-red-500">{error}</span>
        </div>
      ) : (
        <>
          <div className="scroll-button left" 
               style={{
                 position: 'absolute',
                 left: '5px',
                 top: '50%',
                 transform: 'translateY(-50%)',
                 zIndex: 26,
                 width: '32px',
                 height: '32px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 background: 'white',
                 boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                 borderRadius: '50%',
                 cursor: 'pointer'
               }}
               onClick={() => scroll('left')}>
            <i className="fas fa-chevron-left"></i>
          </div>
          
          <div className="container" 
               ref={containerRef}
               style={{
                 flex: 1,
                 overflowX: 'auto',
                 scrollbarWidth: 'none',
                 msOverflowStyle: 'none',
                 position: 'relative',
                 padding: '0 10px'
               }}>
            <ul className="category-list"
                style={{
                  display: 'flex',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  whiteSpace: 'nowrap',
                  height: '100%'
                }}>
              <li className={`category-item ${currentCategory === 'All Products' ? 'active' : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: '100%'
                  }}>
                <button 
                  onClick={() => handleCategoryClick('All Products')}
                  className="category-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1rem',
                    height: '100%',
                    fontWeight: 500,
                    color: currentCategory === 'All Products' ? '#6200ea' : '#374151',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    position: 'relative'
                  }}
                >
                  All Products
                  {currentCategory === 'All Products' && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '10%',
                      width: '80%',
                      height: '3px',
                      backgroundColor: '#6200ea',
                      borderRadius: '3px 3px 0 0'
                    }}></span>
                  )}
                </button>
              </li>
              
              {categories.map(category => (
                <li 
                  key={category} 
                  className={`category-item ${currentCategory === category ? 'active' : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="category-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 1rem',
                      height: '100%',
                      fontWeight: currentCategory === category ? 600 : 500,
                      color: currentCategory === category ? '#6200ea' : '#374151',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      position: 'relative'
                    }}
                  >
                    {category}
                    {currentCategory === category && (
                      <span style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '10%',
                        width: '80%',
                        height: '3px',
                        backgroundColor: '#6200ea',
                        borderRadius: '3px 3px 0 0'
                      }}></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="scroll-button right"
               style={{
                 position: 'absolute',
                 right: '5px',
                 top: '50%',
                 transform: 'translateY(-50%)',
                 zIndex: 26,
                 width: '32px',
                 height: '32px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 background: 'white',
                 boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                 borderRadius: '50%',
                 cursor: 'pointer'
               }}
               onClick={() => scroll('right')}>
            <i className="fas fa-chevron-right"></i>
          </div>
        </>
      )}
    </nav>
  );
}

export default CategoryNavigator;