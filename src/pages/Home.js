import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Spinner } from 'flowbite-react';
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
  const heroRef = useRef(null);
  const location = useLocation();
const productsRef = useRef(null);

  const [heroSettings, setHeroSettings] = useState({
    type: 'image',
    mediaUrl: '/hero.jpg',
    title: 'Just Trendy - Where Trends Meet Need!',
    subtitle: 'Discover Amazing Products at Great Prices'
  });

  // Calculate header height on mount and when window resizes (not on scroll)
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header')?.parentElement;
      if (header) {
        const height = header.offsetHeight;
        setHeaderHeight(height);
      }
    };
    useEffect(() => {
      const params = new URLSearchParams(location.search);
      if (params.get('scrollToProducts') === 'true' && productsRef.current) {
        productsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [location]);
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
    let filtered = products;

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
    } else if (selectedCategory !== 'all') {
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

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Trendy E-commerce Store | Discover Amazing Products</title>
        <meta name="description" content="Welcome to our trendy e-commerce store. Discover amazing products at great prices." />
      </Helmet>

      {/* Hero Section - Fixed positioning based on initial header height */}
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

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          </div>
        </div>
      </section>

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

      {!searchQuery && (
        <>
          {/* Special Offers Section - Horizontal Scrollable Row */}
          <section className="py-10">
            <div className="container mx-auto px-0"> 
              {/* Daily Timer added here - above the Special Offers title */}
              <DailyTimer />
              
              <div className="mb-2 text-center">
                <h2 className="text-3xl font-bold">Special Offers</h2>
              </div>
              <div>
                {products.filter(p => p.discountPercentage > 0).length > 0 && (
                  <ProductList 
                    title=" " 
                    products={products.filter(p => p.discountPercentage > 0)} 
                    scrollable={true}
                  />
                )}
              </div>
            </div>
          </section>

          {/* All Products Section - Grid Layout */}
          <section ref={productsRef} className="py-10">
            <div className="container mx-auto px-4">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold">All Products</h2>
              </div>
              
              {/* Category Filter */}
              <div className="max-w-md mx-auto mb-8">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
              
              {/* Products Grid - Mobile: 1 per row, Tablet: 2 per row, Desktop: 4-5 per row */}
              <ProductList 
                products={products} 
                filterCategory={selectedCategory}
                scrollable={false} // Grid view for all products
                mobileColumns={1} // 1 column for mobile view
              />
            </div>
          </section>
        </>
      )}

      {/* Search Results Section */}
      {searchQuery && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Search Results for "{searchQuery}"
            </h2>

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
                scrollable={false} // Grid view for search results
                mobileColumns={1} // 1 column for mobile view in search results too
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