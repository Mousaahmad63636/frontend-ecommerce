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
        
        // Extract unique categories from discounted products
        const uniqueCategories = [...new Set(discountedProducts.map(product => product.category))];
        setCategories(uniqueCategories);
        
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
      const filtered = products.filter(product => product.category === selectedCategory);
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

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Special Offers</h2>
        <Link to="/?discount=true" className="btn btn-outline-primary">
          View All Offers
        </Link>
      </div>

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
        <ProductList products={filteredProducts} />
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