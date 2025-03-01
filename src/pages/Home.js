// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import ProductList from '../components/ProductList';
import { useScrollPosition } from '../hooks/useScrollPosition';
import BestSelling from '../components/BestSelling';
import DiscountedProducts from '../components/DiscountedProducts';
import ContactSection from '../components/ContactSection';
import DailyTimer from '../components/DailyTimer/DailyTimer';
import './Home.css';
import TimerDisplay from '../components/Admin/TimerDisplay';
import { getImageUrl } from '../utils/imageUtils';

function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroSettings, setHeroSettings] = useState({
    type: 'image',
    mediaUrl: '/hero.jpg',
    title: 'Welcome to Our Store',
    subtitle: 'Discover amazing products at great prices'
  });
  
  const scrollPosition = useScrollPosition();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('q');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  // Fetch products and settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsData = await api.getProducts();
        setProducts(productsData);
        
        // Extract ALL categories (primary and secondary) from products
        const allCategories = new Set();
        
        productsData.forEach(product => {
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
        
        // Fetch hero settings
        const settingsData = await api.getSettings();
        if (settingsData?.heroSection) {
          setHeroSettings(settingsData.heroSection);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter products based on category and search query
  useEffect(() => {
    let result = [...products];
    
    // Filter by category if selected
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(product => {
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
    }
    
    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    
    // Update URL with selected category
    const params = new URLSearchParams(location.search);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    // Keep search query if exists
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    
    navigate(`?${params.toString()}`);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Update URL with search query
    const params = new URLSearchParams(location.search);
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    
    // Keep category if selected
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    
    navigate(`?${params.toString()}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section position-relative">
        {heroSettings.type === 'image' ? (
          <div 
            className="hero-image"
            style={{ 
              backgroundImage: `url(${getImageUrl(heroSettings.mediaUrl)})`,
              height: '500px',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            <div className="hero-content position-absolute top-50 start-50 translate-middle text-center text-white p-4">
              <h1 className="display-4 fw-bold">{heroSettings.title}</h1>
              <p className="lead">{heroSettings.subtitle}</p>
              <TimerDisplay />
            </div>
          </div>
        ) : (
          <div className="hero-video-container">
            <video 
              src={getImageUrl(heroSettings.mediaUrl)} 
              autoPlay 
              muted 
              loop 
              className="hero-video"
            />
            <div className="hero-content position-absolute top-50 start-50 translate-middle text-center text-white p-4">
              <h1 className="display-4 fw-bold">{heroSettings.title}</h1>
              <p className="lead">{heroSettings.subtitle}</p>
              <TimerDisplay />
            </div>
          </div>
        )}
      </div>

      <div className="container py-5">
        {/* Category and Search Filters */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="d-flex align-items-center mb-3">
              <label className="me-2 fw-bold">Filter by Category:</label>
              <select 
                className="form-select" 
                value={selectedCategory} 
                onChange={(e) => handleCategoryChange(e.target.value)}
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
          <div className="col-md-6">
            <form onSubmit={handleSearch} className="d-flex">
              <input 
                type="text" 
                className="form-control me-2" 
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>
        </div>

        {/* Daily Timer */}
        <DailyTimer />

        {/* Discounted Products Section */}
        <DiscountedProducts />

        {/* Main Product List */}
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <ProductList 
            title={selectedCategory === 'all' ? 'All Products' : `${selectedCategory} Products`}
            products={filteredProducts} 
            loading={loading}
            scrollable={false}
            mobileColumns={2}
          />
        )}

        {/* Best Selling Products */}
        <BestSelling />

        {/* Contact Section */}
        <ContactSection />
      </div>
    </div>
  );
}

export default Home;