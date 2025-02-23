import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Spinner, Select } from 'flowbite-react';
import { getImageUrl } from '../utils/imageUtils';

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
  const searchQuery = searchParams.get('q');
  const [heroSettings, setHeroSettings] = useState({
    type: 'image',
    mediaUrl: '/hero.jpg',
    title: 'Welcome to Our Trendy E-commerce Store',
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
        <meta name="description" content="Welcome to our trendy e-commerce store. Discover amazing products at great prices. Explore special offers, discounted products, and more." />
        {/* ... rest of your meta tags ... */}
      </Helmet>

      {blackFridayData && (
        <BlackFridayBanner
          endDate={blackFridayData.endDate}
          discount={blackFridayData.discount}
        />
      )}

      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
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
          <div className="absolute inset-0 bg-black/40" /> {/* Overlay */}
        </div>
      
      </section>

      {!searchQuery && (
        <>
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <DiscountedProducts />
              <div className="flex justify-between items-center mb-8">
                <TimerDisplay />
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <BestSelling />
            </div>
          </section>
        </>
      )}

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover Our Trendy Products'}
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
                    No results found for "{searchQuery}". Try a different search term or browse our trendy categories.
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