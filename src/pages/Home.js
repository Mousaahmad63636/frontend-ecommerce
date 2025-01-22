import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BestSelling from '../components/BestSelling';
import ProductList from '../components/ProductList';
import ContactSection from '../components/ContactSection';
import BlackFridayBanner from '../components/BlackFridayBanner/BlackFridayBanner';
import Loading from '../components/Loading/Loading';
import api from '../api/api';
import './Home.css';
import TimerDisplay from '../components/Admin/TimerDisplay';
import DiscountedProducts from '../components/DiscountedProducts';

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
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [heroSettings, setHeroSettings] = useState({
    type: 'image',
    mediaUrl: '/hero.jpg',
    title: 'Welcome to our Store',
    subtitle: 'Discover amazing products at great prices'
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [settingsResponse, productsData, blackFridayResponse] = await Promise.all([
          api.getSettings(),
          api.getProducts(),
          api.getBlackFridayData().catch(() => null)
        ]);

        // Update hero settings
        if (settingsResponse?.heroSection) {
          setHeroSettings(settingsResponse.heroSection);
        }

        // Update products and categories
        setProducts(productsData);
        const uniqueCategories = [...new Set(productsData.map(product => product.category))];
        setCategories(uniqueCategories);

        // Update Black Friday data
        if (blackFridayResponse?.isActive) {
          setBlackFridayData({
            discount: blackFridayResponse.discountPercentage,
            endDate: blackFridayResponse.endDate
          });
        }

      } catch (error) {
        console.error('Error loading page data:', error);
        setError('Failed to load page data. Please try again.');
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
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
    }
  }, [products, searchQuery, selectedCategory]);

  if (initialLoading) {
    return (
      <div className="container mt-5 text-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error Loading Page</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {blackFridayData && (
        <BlackFridayBanner
          endDate={blackFridayData.endDate}
          discount={blackFridayData.discount}
        />
      )}

      <section className="hero-section">
        {heroSettings.type === 'video' ? (
          <video
            src={heroSettings.mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            className="hero-media"
          />
        ) : (
          <div
            className="hero-media"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroSettings.mediaUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
        <div className="hero-content">
          <h1 className="hero-title">{heroSettings.title}</h1>
          <p className="hero-subtitle">{heroSettings.subtitle}</p>
        </div>
      </section>

      {!searchQuery && (
        <>
          <section className="py-5 bg-light">
            <div className="container">
              <DiscountedProducts />
            </div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <h2 className="mb-0">Special Offers</h2>
                <TimerDisplay />
              </div>
            </div>
          </section>
          <section className="py-5">
            <div className="container">
              <BestSelling />
            </div>
          </section>
        </>
      )}

      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Our Products'}
          </h2>

          {!searchQuery && (
            <div className="row justify-content-center mb-4">
              <div className="col-md-6">
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
          )}

          {loading ? (
            <Loading />
          ) : filteredProducts.length > 0 ? (
            <ProductList products={filteredProducts} />
          ) : (
            <div className="text-center py-5">
              <h3>No products found</h3>
              {searchQuery && (
                <p>No results found for "{searchQuery}". Try a different search term or browse our categories.</p>
              )}
            </div>
          )}
        </div>
      </section>

      <ContactSection />
    </div>
  );
}

export default Home;