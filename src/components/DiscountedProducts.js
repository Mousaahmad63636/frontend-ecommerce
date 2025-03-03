// src/components/DiscountedProducts.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from './Notification/NotificationProvider';
import api from './../api/api';
import ProductList from './ProductList';

const DiscountedProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getProducts();
        // Filter products with active discounts
        const discountedProducts = response.filter(product => 
          product.discountPercentage > 0 && 
          product.discountEndDate && 
          new Date(product.discountEndDate) > new Date()
        );
        setProducts(discountedProducts);
        
        // Extract ALL categories (primary and secondary) from products
        const allCategories = new Set();
        
        discountedProducts.forEach(product => {
          // Add primary category
          if (product.category) {
            allCategories.add(product.category);
          }
          
          // Add secondary categories from the categories array
          if (Array.isArray(product.categories)) {
            product.categories.forEach(category => {
              if (category) allCategories.add(category);
            });
          }
        });
        
        setCategories([...allCategories].sort());
        
        // Set initial filtered products
        setFilteredProducts(discountedProducts);
      } catch (err) {
        console.error('Error fetching discounted products:', err);
        setError('Unable to load discounted products');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, []);

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => {
        // Check primary category
        if (product.category === selectedCategory) {
          return true;
        }
        
        // Check categories array for secondary categories
        if (Array.isArray(product.categories) && product.categories.includes(selectedCategory)) {
          return true;
        }
        
        return false;
      });
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
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

  if (error) {
    return null; // Hide the section completely if there's an error
  }

  if (!products || products.length === 0) {
    return null;
  }

  // Create the custom URL for viewing all discounted products
  const viewAllDiscountedUrl = selectedCategory !== 'all'
    ? `/?showDiscounted=true&category=${encodeURIComponent(selectedCategory)}`
    : '/?showDiscounted=true';

  return (
    <div className="container my-4">
      {/* Category Filter */}
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <div className="input-group">
            <label className="input-group-text" htmlFor="categoryFilter">
              <i className="fas fa-filter me-2"></i>
              Filter by Category
            </label>
            <select
              className="form-select"
              id="categoryFilter"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Display filtered products or message if none found */}
      {filteredProducts.length > 0 ? (
        <ProductList
          title="Special Offers"
          products={filteredProducts}
          loading={loading}
          error={error}
          scrollable={true}
          filterCategory={selectedCategory !== 'all' ? selectedCategory : null}
          viewAllUrl={viewAllDiscountedUrl}
          viewAllText="View all offers"
        />
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">
            No discounted products found in this category.
          </p>
          <button 
            className="btn btn-link"
            onClick={() => setSelectedCategory('all')}
          >
            View all discounted products
          </button>
        </div>
      )}

      {/* Show total count */}
      <div className="text-end mt-3">
        <small className="text-muted">
          Showing {filteredProducts.length} of {products.length} discounted products
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </small>
      </div>
    </div>
  );
};

export default DiscountedProducts;