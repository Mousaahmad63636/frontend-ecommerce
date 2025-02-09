import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  HomeWrapper,
  HeroSection,
  HeroMedia,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  Section,
  SectionTitle,
  CategorySelect,
  NoResults,
  LoadingWrapper,
  ContentContainer
} from '../styles/HomeStyles';

// Component imports
import BestSelling from '../components/BestSelling';
import ProductList from '../components/ProductList';
import ContactSection from '../components/ContactSection';
import BlackFridayBanner from '../components/BlackFridayBanner/BlackFridayBanner';
import Loading from '../components/Loading/Loading';
import TimerDisplay from '../components/Admin/TimerDisplay';
import DiscountedProducts from '../components/DiscountedProducts';
import api from '../api/api';

function Home() {
  // State management
  const [state, setState] = useState({
    products: [],
    filteredProducts: [],
    categories: [],
    blackFridayData: null,
    heroSettings: {
      type: 'image',
      mediaUrl: '/hero.jpg',
      title: 'Welcome to Our Trendy E-commerce Store',
      subtitle: 'Discover Amazing Products at Great Prices'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  // Fetch hero settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.getSettings();
        if (response?.heroSection) {
          setState(prev => ({
            ...prev,
            heroSettings: response.heroSection
          }));
        }
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Fetch products and black friday data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, blackFridayResponse] = await Promise.all([
          api.getProducts(),
          api.getBlackFridayData?.() || Promise.resolve(null)
        ]);

        const uniqueCategories = [...new Set(productsData.map(product => product.category))];
        
        setState(prev => ({
          ...prev,
          products: productsData,
          categories: uniqueCategories,
          blackFridayData: blackFridayResponse?.isActive ? {
            discount: blackFridayResponse.discountPercentage,
            endDate: blackFridayResponse.endDate
          } : null
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = state.products;

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

    setState(prev => ({ ...prev, filteredProducts: filtered }));
  }, [state.products, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <LoadingWrapper>
        <Loading />
      </LoadingWrapper>
    );
  }

  const renderSEOMetadata = () => (
    <Helmet>
      <title>Trendy E-commerce Store | Discover Amazing Products</title>
      <meta name="description" content="Welcome to our trendy e-commerce store. Discover amazing products at great prices. Explore special offers, discounted products, and more." />
      {/* ... rest of SEO metadata ... */}
    </Helmet>
  );

  const renderHeroSection = () => (
    <HeroSection>
      <HeroMedia
        style={{ backgroundImage: `url(${state.heroSettings.mediaUrl})` }}
        aria-label="Trendy E-commerce Store Hero Section"
      >
        {state.heroSettings.type === 'video' && (
          <video
            src={state.heroSettings.mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            aria-label="Trendy products showcase video"
          />
        )}
      </HeroMedia>
      <HeroContent>
        <HeroTitle>{state.heroSettings.title}</HeroTitle>
        <HeroSubtitle>{state.heroSettings.subtitle}</HeroSubtitle>
      </HeroContent>
    </HeroSection>
  );

  const renderProductsSection = () => (
    <Section background="#f5f5f5">
      <ContentContainer>
        <SectionTitle>
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover Our Trendy Products'}
        </SectionTitle>

        {!searchQuery && (
          <CategorySelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {state.categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </CategorySelect>
        )}

        {error ? (
          <NoResults>
            <h3>Error</h3>
            <p>{error}</p>
          </NoResults>
        ) : state.filteredProducts.length > 0 ? (
          <ProductList products={state.filteredProducts} />
        ) : (
          <NoResults>
            <h3>No Products Found</h3>
            {searchQuery && (
              <p>No results found for "{searchQuery}". Try a different search term or browse our trendy categories.</p>
            )}
          </NoResults>
        )}
      </ContentContainer>
    </Section>
  );

  return (
    <HomeWrapper>
      {renderSEOMetadata()}
      {state.blackFridayData && (
        <BlackFridayBanner
          endDate={state.blackFridayData.endDate}
          discount={state.blackFridayData.discount}
        />
      )}
      {renderHeroSection()}

      {!searchQuery && (
        <>
          <Section background="#f5f5f5">
            <ContentContainer>
              <DiscountedProducts />
              <div className="timer-section">
                <SectionTitle>Special Offers</SectionTitle>
                <TimerDisplay />
              </div>
            </ContentContainer>
          </Section>

          <Section>
            <ContentContainer>
              <BestSelling />
            </ContentContainer>
          </Section>
        </>
      )}

      {renderProductsSection()}
      <ContactSection />
    </HomeWrapper>
  );
}

export default Home;