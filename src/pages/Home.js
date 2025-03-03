// src/pages/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useNotification } from '../components/Notification/NotificationProvider';
import ProductList from '../components/ProductList';
import BestSelling from '../components/BestSelling';
import DiscountedProducts from '../components/DiscountedProducts';
import CategorySlider from '../components/CategorySlider/CategorySlider';
import TimerDisplay from '../components/Admin/TimerDisplay';
import WhatsAppFloat from '../components/ConsultingFloat/ConsultingFloat';
import ContactSection from '../components/ContactSection';
import './Home.css';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const productsRef = useRef(null);

  // State
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);
  const [heroSection, setHeroSection] = useState({
    type: 'image',
    title: 'Welcome to Our Store',
    subtitle: 'Discover amazing products at great prices',
    mediaUrl: ''
  });

  // Load products and settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const productsData = await api.getProducts();
        setProducts(productsData);

        // Fetch categories
        const categoriesResponse = await api.getCategories();
        if (categoriesResponse?.categories) {
          setCategories(categoriesResponse.categories);
        }

        // Fetch settings for hero section
        const settingsData = await api.getSettings();
        if (settingsData) {
          setSettings(settingsData);
          if (settingsData.heroSection) {
            setHeroSection(settingsData.heroSection);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showNotification]);

  // Parse URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    // Check for category filter
    const categoryParam = queryParams.get('category');
    if (categoryParam) {
      setFilterCategory(categoryParam);
    }

    // Check for search query
    const searchParam = queryParams.get('q');
    if (searchParam) {
      setSearchQuery(searchParam);
    }

    // Check for scroll to products
    const scrollToProducts = queryParams.get('scrollToProducts');
    if (scrollToProducts === 'true') {
      setTimeout(() => {
        if (productsRef.current) {
          productsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }

    // Check for show discounted only
    const showDiscounted = queryParams.get('showDiscounted');
    if (showDiscounted === 'true') {
      setShowDiscountedOnly(true);
      
      // Scroll to products section
      setTimeout(() => {
        if (productsRef.current) {
          productsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, [location.search]);

  // Filter and sort products based on criteria
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filterCategory && filterCategory !== 'all') {
      result = result.filter(product => {
        // Check primary category
        if (product.category === filterCategory) {
          return true;
        }
        
        // Check secondary categories array
        if (Array.isArray(product.categories) && product.categories.includes(filterCategory)) {
          return true;
        }
        
        return false;
      });
    }

    // Apply discount filter
    if (showDiscountedOnly) {
      result = result.filter(product => 
        product.discountPercentage > 0 && 
        product.discountEndDate && 
        new Date(product.discountEndDate) > new Date()
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'priceAsc':
          return a.price - b.price;
        case 'priceDesc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'discount':
          return (b.discountPercentage || 0) - (a.discountPercentage || 0);
        case 'newest':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    setFilteredProducts(result);
  }, [products, filterCategory, searchQuery, sortBy, showDiscountedOnly]);

  const handleCategoryChange = (category) => {
    setFilterCategory(category);
    
    // Update URL
    const queryParams = new URLSearchParams(location.search);
    if (category === 'all') {
      queryParams.delete('category');
    } else {
      queryParams.set('category', category);
    }
    
    navigate({ search: queryParams.toString() });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleClearFilters = () => {
    setFilterCategory('all');
    setSearchQuery('');
    setShowDiscountedOnly(false);
    
    // Clear URL parameters
    navigate('/');
  };

  // Render hero section
  const renderHeroSection = () => {
    if (!heroSection?.mediaUrl) {
      return null;
    }

    const heroStyle = heroSection.type === 'image' 
      ? { backgroundImage: `url(${api.getBaseURL() + heroSection.mediaUrl})` }
      : {};

    return (
      <section 
        className="hero-section relative flex items-center justify-center mb-8"
        style={heroStyle}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="container mx-auto px-4 py-20 relative z-10 text-center">
          {heroSection.title && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {heroSection.title}
            </h1>
          )}
          {heroSection.subtitle && (
            <p className="text-xl md:text-2xl text-white mb-8">
              {heroSection.subtitle}
            </p>
          )}
          {heroSection.type === 'video' && heroSection.mediaUrl && (
            <video 
              src={api.getBaseURL() + heroSection.mediaUrl} 
              autoPlay 
              muted 
              loop 
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="pb-12">
      {/* Hero Section */}
      {renderHeroSection()}

      {/* Timer Display */}
      <TimerDisplay />

      {/* Category Slider */}
      <div className="container mx-auto px-4 mb-8">
        <CategorySlider 
          categories={categories} 
          selectedCategory={filterCategory}
          onSelectCategory={handleCategoryChange}
        />
      </div>

      {/* Discounted Products Section */}
      <DiscountedProducts />

      {/* Best Selling Products */}
      <div className="container mx-auto px-4 mb-8">
        <BestSelling />
      </div>

      {/* Main Products Section */}
      <div 
        id="products-section" 
        ref={productsRef}
        className="container mx-auto px-4 mb-12"
      >
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            {showDiscountedOnly ? (
              <h2 className="text-2xl font-bold text-gray-900">
                All Special Offers
                {filterCategory !== 'all' && ` in ${filterCategory}`}
              </h2>
            ) : searchQuery ? (
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results for "{searchQuery}"
                {filterCategory !== 'all' && ` in ${filterCategory}`}
              </h2>
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">
                All Products
                {filterCategory !== 'all' && ` in ${filterCategory}`}
              </h2>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {(filterCategory !== 'all' || searchQuery || showDiscountedOnly) && (
              <button
                onClick={handleClearFilters}
                className="btn btn-outline-secondary py-2 px-3 text-sm flex items-center"
              >
                <i className="fas fa-times-circle mr-2"></i>
                Clear Filters
              </button>
            )}

            <select
              className="form-select py-2 px-3 text-sm border rounded-md"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">Newest First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>

        {/* Products Display */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <i className="fas fa-search fa-3x text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `We couldn't find any products matching "${searchQuery}"`
                : filterCategory !== 'all'
                ? `No products found in the "${filterCategory}" category`
                : showDiscountedOnly
                ? "No discounted products available at the moment"
                : "No products available at the moment"}
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <div key={product._id}>
                <ProductItem product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredProducts.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-right">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            {searchQuery && ` for "${searchQuery}"`}
            {filterCategory !== 'all' && ` in ${filterCategory}`}
            {showDiscountedOnly && ' with discount'}
          </div>
        )}
      </div>

      {/* Contact Section */}
      <ContactSection />

      {/* WhatsApp Float */}
      <WhatsAppFloat />
    </div>
  );
}

// Helper component for individual product items
const ProductItem = ({ product }) => {
  return (
    <div className="product-card bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md relative border border-gray-100">
      {/* Discount Badge */}
      {product.discountPercentage > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium z-10 rounded-full">
          {product.discountType === 'fixed' 
            ? `Save $${product.discountPercentage.toFixed(2)}`
            : `${product.discountPercentage}% OFF`}
        </div>
      )}
      
      {/* Sold Out Overlay */}
      {product.soldOut && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center">
          <span className="text-white font-bold text-lg">SOLD OUT</span>
        </div>
      )}
      
      {/* Product Image */}
      <Link to={`/product/${product._id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.images && product.images.length > 0 
              ? `${api.getBaseURL()}/uploads/products/${product.images[0]}` 
              : '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-contain p-2 transition-transform hover:scale-105"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-3">
        <Link to={`/product/${product._id}`} className="block mb-1">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
        </Link>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-2">
          {product.categories && product.categories.length > 0 
            ? product.categories.map(category => (
                <Link 
                  key={category}
                  to={`/?category=${encodeURIComponent(category)}`}
                  className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-sm hover:bg-gray-200"
                >
                  {category}
                </Link>
              ))
            : product.category && (
                <Link 
                  to={`/?category=${encodeURIComponent(product.category)}`}
                  className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-sm hover:bg-gray-200"
                >
                  {product.category}
                </Link>
              )
          }
        </div>
        
        {/* Price */}
        <div className="flex items-baseline mb-1.5">
          {product.discountPercentage > 0 ? (
            <>
              <span className="text-sm font-bold text-red-500 mr-2">${product.price.toFixed(2)}</span>
              <span className="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</span>
          )}
        </div>
        
        {/* Star Rating */}
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <i 
              key={star} 
              className={`${star <= Math.round(product.rating || 4) ? 'text-yellow-400 fas' : 'text-gray-300 far'} fa-star text-xs`}
            ></i>
          ))}
          <span className="ml-1 text-xs text-gray-500">
            ({product.reviewCount !== undefined ? product.reviewCount : 0})
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;