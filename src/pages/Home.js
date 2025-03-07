// src/pages/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Spinner } from 'flowbite-react';
import { useLocation } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import DailyTimer from '../components/DailyTimer/DailyTimer';
// Component imports
import ProductList from '../components/ProductList';
import ContactSection from '../components/ContactSection';
import BlackFridayBanner from '../components/BlackFridayBanner/BlackFridayBanner';
import api from '../api/api';

function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [blackFridayData, setBlackFridayData] = useState(null);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const searchQuery = searchParams.get('q');
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showSimilarProducts, setShowSimilarProducts] = useState(false);
  const [relatedProductId, setRelatedProductId] = useState(null);
  const heroRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const productsRef = useRef(null);

  const [heroSettings, setHeroSettings] = useState({
    type: 'image',
    mediaUrl: '/hero.jpg',
    title: 'Just Trendy - Where Trends Meet Need!',
    subtitle: 'Discover Amazing Products at Great Prices'
  });

  // Handle navigation to home
  const goToHome = () => {
    navigate('/', { replace: true });
    setShowDiscountedOnly(false);
    setShowAllProducts(false);
    setShowSimilarProducts(false);
    setSelectedCategory('all');
    window.scrollTo(0, 0);
  };

  // Separate useEffect for URL parameters and scroll functionality
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Handle scrollToProducts parameter
    if (params.get('scrollToProducts') === 'true' && productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Handle relatedTo parameter for similar products
    const relatedToParam = params.get('relatedTo');
    if (relatedToParam) {
      setRelatedProductId(relatedToParam);
      setShowSimilarProducts(true);
      setShowDiscountedOnly(false);
      setShowAllProducts(false);
      
      // If there's also a category parameter, set it
      const categoryParam = params.get('category');
      if (categoryParam) {
        setSelectedCategory(categoryParam);
      }
      
      // Scroll to products section
      setTimeout(() => {
        if (productsRef.current) {
          productsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else {
      // Reset showSimilarProducts when not in the URL
      setShowSimilarProducts(false);
    }

    // Handle showDiscounted parameter
    const showDiscounted = params.get('showDiscounted');
    if (showDiscounted === 'true') {
      setShowDiscountedOnly(true);
      setShowAllProducts(false);
      setShowSimilarProducts(false); // Ensure only one view mode is active

      // If there's also a category parameter, set it
      const categoryParam = params.get('category');
      if (categoryParam) {
        setSelectedCategory(categoryParam);
      }

      // Scroll to products section
      setTimeout(() => {
        if (productsRef.current) {
          productsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else if (!relatedToParam) {
      // Reset showDiscountedOnly when not in the URL and not showing related products
      setShowDiscountedOnly(false);
    }

    // Handle showAllProducts parameter
    const showAll = params.get('showAllProducts');
    if (showAll === 'true') {
      setShowAllProducts(true);
      setShowDiscountedOnly(false);
      setShowSimilarProducts(false); // Ensure only one view mode is active

      // If there's also a category parameter, set it
      const categoryParam = params.get('category');
      if (categoryParam) {
        setSelectedCategory(categoryParam);
      }

      // Scroll to products section
      setTimeout(() => {
        if (productsRef.current) {
          productsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else if (!relatedToParam) {
      // Reset showAllProducts when not in the URL and not showing related products
      setShowAllProducts(false);
    }

    // Handle category param when no special view is active
    if (!showDiscounted && !showAll && !relatedToParam && params.get('category')) {
      setSelectedCategory(params.get('category'));
    }
  }, [location.search]);

  // Calculate header height on mount and when window resizes
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header')?.parentElement;
      if (header) {
        const height = header.offsetHeight;
        setHeaderHeight(height);
      }
    };

    // Initial calculation
    updateHeaderHeight();

    // Update only on resize, not on scroll
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.getSettings();
        if (response?.heroSection) {
          setHeroSettings(response.heroSection);
        }
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

        if (api.getBlackFridayData) {
          try {
            const blackFridayResponse = await api.getBlackFridayData();
            if (blackFridayResponse?.isActive) {
              setBlackFridayData({
                discount: blackFridayResponse.discountPercentage,
                endDate: blackFridayResponse.endDate
              });
            }
          } catch (blackFridayError) {
            console.log('Black Friday data not available');
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...products]; // Create a copy to avoid mutating the original

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        (product.category && product.category.toLowerCase().includes(searchLower)) ||
        (Array.isArray(product.categories) && product.categories.some(cat =>
          cat.toLowerCase().includes(searchLower)
        ))
      );
    }
    // Special case for related products filtering
    else if (showSimilarProducts && relatedProductId) {
      const relatedProduct = products.find(p => p._id === relatedProductId);
      
      if (relatedProduct) {
        // Get all categories from the reference product
        const relatedCategories = [];
        
        if (relatedProduct.category) {
          relatedCategories.push(relatedProduct.category);
        }
        
        if (Array.isArray(relatedProduct.categories) && relatedProduct.categories.length > 0) {
          relatedProduct.categories.forEach(cat => {
            if (cat && !relatedCategories.includes(cat)) {
              relatedCategories.push(cat);
            }
          });
        }
        
        // Filter products by matching any category with the reference product
        filtered = products.filter(product => {
          // Skip the reference product itself
          if (product._id === relatedProductId) return false;
          
          // Check if primary category matches any reference category
          if (product.category && relatedCategories.includes(product.category)) {
            return true;
          }
          
          // Check if any product category matches any reference category
          if (Array.isArray(product.categories) && product.categories.length > 0) {
            return product.categories.some(cat => relatedCategories.includes(cat));
          }
          
          return false;
        });
      }
    }
    // Apply category filter
    else if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
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

    // Apply discount filter if showDiscountedOnly is true
    if (showDiscountedOnly) {
      filtered = filtered.filter(product =>
        product.discountPercentage > 0
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, showDiscountedOnly, showSimilarProducts, relatedProductId]);

  // Handle category change with URL update
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);

    // Update URL to reflect the new category
    let params = new URLSearchParams(location.search);

    if (newCategory === 'all') {
      params.delete('category');
    } else {
      params.set('category', newCategory);
    }

    // Preserve view mode parameters if they exist
    if (showDiscountedOnly) {
      params.set('showDiscounted', 'true');
    } else if (showAllProducts) {
      params.set('showAllProducts', 'true');
    } else if (showSimilarProducts && relatedProductId) {
      params.set('relatedTo', relatedProductId);
    }

    navigate({ search: params.toString() });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  // Get discounted products
  const discountedProducts = products.filter(p => p.discountPercentage > 0);

  // Create the custom URL for viewing all discounted products
  const viewAllDiscountedUrl = selectedCategory !== 'all'
    ? `/?showDiscounted=true&category=${encodeURIComponent(selectedCategory)}`
    : '/?showDiscounted=true';

  // Create URL for viewing all products with selected category
  const viewAllProductsUrl = selectedCategory !== 'all'
    ? `/?showAllProducts=true&category=${encodeURIComponent(selectedCategory)}`
    : '/?showAllProducts=true';

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Trendy E-commerce Store | Discover Amazing Products</title>
        <meta name="description" content="Welcome to our trendy e-commerce store. Discover amazing products at great prices." />
      </Helmet>

      {/* Hero Section - Fixed positioning based on initial header height */}
      {!showDiscountedOnly && !showAllProducts && !showSimilarProducts && !searchQuery && (
        <section
          ref={heroRef}
          className="w-full"
          style={{ marginTop: `${headerHeight}px` }}
        >
          <div className="w-full overflow-hidden">
            <div className="relative">
              {heroSettings.type === 'image' ? (
                <img
                  src={getImageUrl(heroSettings.mediaUrl)}
                  alt="Hero banner"
                  className="w-full h-auto"
                />
              ) : (
                <video
                  src={getImageUrl(heroSettings.mediaUrl)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Admin Panel Section */}
      {user && user.role === 'admin' && (
        <section className="py-8 bg-gray-100">
          <div className="container mx-auto px-0">
            <div className="bg-white rounded-lg shadow-md p-6 text-center mx-4">
              <h3 className="text-2xl font-bold mb-4">Admin Panel</h3>
              <p className="mb-4">Manage your store, products, and orders</p>
              <Link
                to="/admin"
                className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-all duration-300"
              >
                Go to Admin Dashboard
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Black Friday Banner */}
      {blackFridayData && (
        <div className="bg-black text-white py-3">
          <div className="container mx-auto px-0">
            <div className="mx-4">
              <BlackFridayBanner
                endDate={blackFridayData.endDate}
                discount={blackFridayData.discount}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content - either normal homepage or special views */}
      {!searchQuery && !showDiscountedOnly && !showAllProducts && !showSimilarProducts && (
        <>
          {/* Special Offers Section - Horizontal Scrollable Row */}
          <section className="py-10">
            <div className="container mx-auto px-0">
              {/* Daily Timer added here - above the Special Offers title */}
              <DailyTimer />
              <br></br>
              <div className="mb-2 text-center">
                <h2 className="text-3xl font-bold">Special Offers</h2>
              </div>
              <div>
                {discountedProducts.length > 0 ? (
                  <ProductList
                    title=" "
                    products={discountedProducts}
                    scrollable={true}
                    viewAllUrl={viewAllDiscountedUrl}
                    viewAllText="View All Offers"
                  />
                ) : (
                  <div className="text-center py-5">
                    <p className="text-gray-500">
                      No discounted products available at the moment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Explore Our Products Section - Now also Horizontal Scrollable */}
          <section ref={productsRef} className="py-10">
            <div className="container mx-auto px-0">
              <div className="mb-2 text-center">
                <h2 className="text-3xl font-bold">Explore Our Products</h2>
              </div>

              {/* Category Filter */}
              <div className="max-w-md mx-auto mb-8 px-4">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Horizontal Scrollable, just like Special Offers */}
              {filteredProducts.length > 0 ? (
                <ProductList
                  title=" "
                  products={filteredProducts}
                  filterCategory={selectedCategory !== 'all' ? selectedCategory : null}
                  scrollable={true}
                  viewAllUrl={viewAllProductsUrl}
                  viewAllText="View All Products"
                />
              ) : (
                <div className="text-center py-5 px-4">
                  <p className="text-gray-500">
                    No products available in this category.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Similar Products Section */}
      {!searchQuery && !showDiscountedOnly && !showAllProducts && showSimilarProducts && (
        <section
          ref={productsRef}
          className="py-10"
          style={{ paddingTop: `${headerHeight + 40}px` }}
        >
          <div className="container mx-auto px-4">
            {/* Back to Home Button with Title */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={goToHome}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <i className="fas fa-arrow-left text-sm mr-1"></i>
                Home
              </button>

              <h2 className="text-2xl font-bold text-center">Similar Products</h2>

              {/* Empty div to maintain flex spacing */}
              <div className="w-[100px]"></div>
            </div>

            {/* Category Filter */}
            <div className="max-w-md mx-auto mb-8">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <ProductList
                products={filteredProducts}
                scrollable={false}
                mobileColumns={2}
              />
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl mb-2">No Similar Products Found</h3>
                  <p className="text-gray-600 mb-4">
                    No similar products available
                    {selectedCategory !== 'all' && ` in the "${selectedCategory}" category`}.
                  </p>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    View All Categories
                  </button>
                </div>
              </div>
            )}

            {/* Return to Home Button */}
            <div className="flex justify-center mt-8 mb-4">
              <button
                onClick={goToHome}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded transition-colors duration-200 text-center min-w-[240px]"
              >
                Return to Home
              </button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-500">
              Showing {filteredProducts.length} similar products
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </div>
          </div>
        </section>
      )}

      {/* View All Discounted Products Section */}
      {!searchQuery && showDiscountedOnly && !showAllProducts && !showSimilarProducts && (
        <section
          ref={productsRef}
          className="py-10"
          style={{ paddingTop: `${headerHeight + 40}px` }} // Add headerHeight
        >
          <div className="container mx-auto px-4">
            {/* Back to Home Button - Above the title */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={goToHome}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <i className="fas fa-arrow-left text-sm mr-1"></i>
                Home
              </button>

              <h2 className="text-2xl font-bold text-center">Special Offers</h2>

              {/* Empty div to maintain flex spacing */}
              <div className="w-[100px]"></div>
            </div>

            {/* Category Filter */}
            <div className="max-w-md mx-auto mb-8">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <ProductList
                products={filteredProducts}
                scrollable={false}
                mobileColumns={2} // Changed from 1 to 2 for mobile view
              />
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl mb-2">No Discounted Products Found</h3>
                  <p className="text-gray-600 mb-4">
                    No discounted products available
                    {selectedCategory !== 'all' && ` in the "${selectedCategory}" category`}.
                  </p>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    View All Categories
                  </button>
                </div>
              </div>
            )}

            {/* Return to Home Button */}
            <div className="flex justify-center mt-8 mb-4">
              <button
                onClick={goToHome}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded transition-colors duration-200 text-center min-w-[240px]"
              >
                Return to Home
              </button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-500">
              Showing {filteredProducts.length} discounted products
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </div>
          </div>
        </section>
      )}

      {/* View All Products Section */}
      {!searchQuery && !showDiscountedOnly && showAllProducts && !showSimilarProducts && (
        <section
          ref={productsRef}
          className="py-10"
          style={{ paddingTop: `${headerHeight + 40}px` }} // Add headerHeight
        >
          <div className="container mx-auto px-4">
            {/* Back to Home Button with Title */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={goToHome}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <i className="fas fa-arrow-left text-sm mr-1"></i>
                Home
              </button>

              <h2 className="text-2xl font-bold text-center">All Products</h2>

              {/* Empty div to maintain flex spacing */}
              <div className="w-[100px]"></div>
            </div>

            {/* Category Filter */}
            <div className="max-w-md mx-auto mb-8">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <ProductList
                products={filteredProducts}
                scrollable={false}
                mobileColumns={2} // Changed from 1 to 2 for mobile view
              />
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl mb-2">No Products Found</h3>
                  <p className="text-gray-600 mb-4">
                    No products available
                    {selectedCategory !== 'all' && ` in the "${selectedCategory}" category`}.
                  </p>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    View All Categories
                  </button>
                </div>
              </div>
            )}

            {/* Return to Home Button */}
            <div className="flex justify-center mt-8 mb-4">
              <button
                onClick={goToHome}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded transition-colors duration-200 text-center min-w-[240px]"
              >
                Return to Home
              </button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-500">
              Showing {filteredProducts.length} products
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </div>
          </div>
        </section>
      )}

      {/* Search Results Section */}
      {searchQuery && (
        <section
          className="py-10"
          style={{ paddingTop: `${headerHeight + 40}px` }} // Add headerHeight
        >
          <div className="container mx-auto px-4">
            {/* Back to Home Button with Title */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={goToHome}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <i className="fas fa-arrow-left text-sm mr-1"></i>
               Home
              </button>

              <h2 className="text-2xl font-bold text-center">Search Results: "{searchQuery}"</h2>

              {/* Empty div to maintain flex spacing */}
              <div className="w-[100px]"></div>
            </div>

            {error ? (
              <div className="text-center py-8">
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-red-600 text-xl mb-2">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <ProductList
                products={filteredProducts}
                scrollable={false}
                mobileColumns={1} // Keeping this at 1 for search results
              />
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl mb-2">No Products Found</h3>
                  <p className="text-gray-600">
                    No results found for "{searchQuery}". Try a different search term or browse our categories.
                  </p>
                </div>
              </div>
            )}

            {/* Return to Home Button */}
            <div className="flex justify-center mt-8 mb-4">
              <button
                onClick={goToHome}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded transition-colors duration-200 text-center min-w-[240px]"
              >
                Return to Home
              </button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-500">
              Showing {filteredProducts.length} products
            </div>
          </div>
        </section>
      )}

      <ContactSection />
    </div>
  );
}

export default Home;