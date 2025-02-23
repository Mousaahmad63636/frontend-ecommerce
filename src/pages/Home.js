import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getImageUrl } from '../utils/imageUtils';

// Component imports
import BestSelling from '../components/BestSelling';
import ProductList from '../components/ProductList';
import ContactSection from '../components/ContactSection';
import BlackFridayBanner from '../components/BlackFridayBanner/BlackFridayBanner';
import TimerDisplay from '../components/Admin/TimerDisplay';
import DiscountedProducts from '../components/DiscountedProducts';
import ScrollableSection from '../components/ScrollableSection/ScrollableSection';
import api from '../api/api';

function Home() {
  // State Management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [blackFridayData, setBlackFridayData] = useState(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [heroSettings, setHeroSettings] = useState({
    type: 'image',
    mediaUrl: '/hero.jpg',
    title: 'Welcome to Our Trendy E-commerce Store',
    subtitle: 'Discover Amazing Products at Great Prices'
  });

  // Fetch Settings
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

  // Fetch Products and Categories
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

  // Filter Products
  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Trendy E-commerce Store | Discover Amazing Products</title>
        <meta name="description" content="Welcome to our trendy e-commerce store. Discover amazing products at great prices." />
      </Helmet>

      {/* Top Banner */}
      {blackFridayData && (
        <div className="pt-[136px] md:pt-[120px]">
          <BlackFridayBanner
            endDate={blackFridayData.endDate}
            discount={blackFridayData.discount}
          />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[80vh] mt-[136px] md:mt-[120px]">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
          style={{
            backgroundImage: `url(${getImageUrl(heroSettings.mediaUrl)})`,
          }}
        >
          {heroSettings.type === 'video' && (
            <video
              src={getImageUrl(heroSettings.mediaUrl)}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              aria-label="Trendy products showcase video"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
        </div>
        
        <div className="relative z-10 container mx-auto h-full flex items-center">
          <div className="max-w-3xl px-4 py-12 md:py-20">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight animate-fade-in">
              {heroSettings.title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 animate-fade-in-delay">
              {heroSettings.subtitle}
            </p>
            <button 
              className="bg-primary-600 text-white px-8 py-3 rounded-full hover:bg-primary-700 
                transition-all duration-300 transform hover:scale-105 animate-fade-in-delay-2"
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Featured Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="relative overflow-hidden rounded-lg aspect-square group"
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 
                  transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center 
                  transform group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white text-lg md:text-xl font-medium">
                    {category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {!searchQuery && (
        <>
          {/* Discounted Products Section */}
          <ScrollableSection title="Special Offers">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <TimerDisplay />
              </div>
              <DiscountedProducts />
            </div>
          </ScrollableSection>

          {/* Best Selling Section */}
          <ScrollableSection title="Best Selling Products">
            <div className="container mx-auto px-4">
              <BestSelling />
            </div>
          </ScrollableSection>
        </>
      )}

      {/* Main Products Section */}
      <section className="py-8 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover Our Products'}
          </h2>

          {!searchQuery && (
            <div className="max-w-xs mx-auto mb-8">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 
                  focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          <ProductList 
            products={filteredProducts}
            loading={loading}
            error={error}
          />

          <div className="text-center mt-4 text-sm text-gray-500">
            Showing {filteredProducts.length} products
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}

// Add these animations to your global CSS or tailwind.config.js
const animations = {
  '.animate-fade-in': {
    opacity: 0,
    animation: 'fadeIn 0.8s ease-out forwards',
  },
  '.animate-fade-in-delay': {
    opacity: 0,
    animation: 'fadeIn 0.8s ease-out 0.3s forwards',
  },
  '.animate-fade-in-delay-2': {
    opacity: 0,
    animation: 'fadeIn 0.8s ease-out 0.6s forwards',
  },
  '@keyframes fadeIn': {
    '0%': { 
      opacity: 0,
      transform: 'translateY(20px)',
    },
    '100%': { 
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
};

export default Home;