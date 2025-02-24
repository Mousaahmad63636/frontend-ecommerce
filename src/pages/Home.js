import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Spinner, Select } from 'flowbite-react';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';

// Component imports
import BestSelling from '../components/BestSelling';
import ProductList from '../components/ProductList';
import ContactSection from '../components/ContactSection';
import BlackFridayBanner from '../components/BlackFridayBanner/BlackFridayBanner';
import TimerDisplay from '../components/Admin/TimerDisplay';
import DiscountedProducts from '../components/DiscountedProducts';
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
  const [heroSettings, setHeroSettings] = useState({
    type: 'image',
    mediaUrl: '/hero.jpg',
    title: 'Just Trendy - Where Trends Meet Need!',
    subtitle: 'Discover Amazing Products at Great Prices'
  });

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

        const uniqueCategories = [...new Set(productsData.map(product => product.category))];
        setCategories(uniqueCategories);

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
        product.category.toLowerCase().includes(searchLower)
      );
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
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

      {/* Hero Section with Responsive Height */}
      <section className="w-full relative mt-[60px] md:mt-[80px]">
        <div 
          className="w-full relative overflow-hidden" 
          style={{ 
            paddingTop: '42.85%', // Wider aspect ratio (21:9)
            maxHeight: '700px',   // Increased max height
            minHeight: '300px'    // Minimum height for small screens
          }}
        > 
          <div 
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center" 
            style={{ 
              backgroundImage: `url(${getImageUrl(heroSettings.mediaUrl)})`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover' // Ensures full image is visible
            }} 
          >
            {heroSettings.type === 'video' && (
              <video 
                src={getImageUrl(heroSettings.mediaUrl)} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute top-0 left-0 w-full h-full object-cover" 
                style={{ 
                  objectPosition: 'center center',
                  objectFit: 'cover' // Ensures full video is visible
                }} 
                aria-label="Trendy products showcase video" 
              />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {heroSettings.title}
                  </h1>
                  <p className="text-base md:text-xl text-white/90 mb-6">
                    {heroSettings.subtitle}
                  </p>
                  <button className="bg-primary-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-full hover:bg-primary-700 transition-all duration-300">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Panel Section */}
      {user && user.role === 'admin' && (
        <section className="py-8 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
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
          <div className="container mx-auto px-4">
            <BlackFridayBanner
              endDate={blackFridayData.endDate}
              discount={blackFridayData.discount}
            />
          </div>
        </div>
      )}
      {!searchQuery && (
        <>
          {/* Featured Categories */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">Featured Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.slice(0, 4).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="relative overflow-hidden rounded-lg aspect-square group"
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-lg md:text-xl font-medium">{category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Discounted Products */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Special Offers</h2>
                <TimerDisplay />
              </div>
              <DiscountedProducts />
            </div>
          </section>

          {/* Best Selling Products */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <BestSelling />
            </div>
          </section>
        </>
      )}

      {/* Main Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h2>

          {!searchQuery && (
            <div className="max-w-md mx-auto mb-8">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {error ? (
            <div className="text-center py-8">
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-red-600 text-xl mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <ProductList products={filteredProducts} />
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl mb-2">No Products Found</h3>
                {searchQuery && (
                  <p className="text-gray-600">
                    No results found for "{searchQuery}". Try a different search term or browse our categories.
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="text-center mt-4 text-sm text-gray-500">
            Showing {filteredProducts.length} products
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}

export default Home;