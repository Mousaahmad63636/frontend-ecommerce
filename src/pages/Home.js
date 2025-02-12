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
  LoadingWrapper
} from '../styles/HomeStyles';

import BestSelling from '../components/BestSelling';
import ProductList from '../components/ProductList';
import ContactSection from '../components/ContactSection';
import BlackFridayBanner from '../components/BlackFridayBanner/BlackFridayBanner';
import Loading from '../components/Loading/Loading';
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
      <LoadingWrapper>
        <Loading />
      </LoadingWrapper>
    );
  }

  return (
    <HomeWrapper>
      <Helmet>
        <title>Trendy E-commerce Store | Discover Amazing Products</title>
        <meta name="description" content="Welcome to our trendy e-commerce store. Discover amazing products at great prices. Explore special offers, discounted products, and more." />
        <meta name="keywords" content="e-commerce, trendy products, online shopping, special offers, discounted products, best selling, contact us" />
        <meta property="og:title" content="Trendy E-commerce Store | Discover Amazing Products" />
        <meta property="og:description" content="Welcome to our trendy e-commerce store. Discover amazing products at great prices. Explore special offers, discounted products, and more." />
        <meta property="og:image" content="/hero.jpg" />
        <meta property="og:url" content="https://www.yourstore.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Trendy E-commerce Store | Discover Amazing Products" />
        <meta name="twitter:description" content="Welcome to our trendy e-commerce store. Discover amazing products at great prices. Explore special offers, discounted products, and more." />
        <meta name="twitter:image" content="/hero.jpg" />
        
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://www.yourstore.com",
              "name": "Trendy E-commerce Store",
              "description": "Discover amazing trendy products at great prices.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.yourstore.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </script>
      </Helmet>

      {blackFridayData && (
        <BlackFridayBanner
          endDate={blackFridayData.endDate}
          discount={blackFridayData.discount}
        />
      )}

      <HeroSection>
        <HeroMedia
          style={{
            backgroundImage: `url(${heroSettings.mediaUrl})`
          }}
          aria-label="Trendy E-commerce Store Hero Section"
        >
          {heroSettings.type === 'video' ? (
            <video
              src={heroSettings.mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              aria-label="Trendy products showcase video"
            />
          ) : null}
        </HeroMedia>
        <HeroContent>
          <HeroTitle>{heroSettings.title}</HeroTitle>
          <HeroSubtitle>{heroSettings.subtitle}</HeroSubtitle>
        </HeroContent>
      </HeroSection>

      {!searchQuery && (
        <>
          <Section background="#f5f5f5">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <DiscountedProducts />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <TimerDisplay />
              </div>
            </div>
          </Section>

          <Section>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <BestSelling />
            </div>
          </Section>
        </>
      )}

      <Section background="#f5f5f5">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <SectionTitle>
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover Our Trendy Products'}
          </SectionTitle>

          {!searchQuery && (
            <CategorySelect
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
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
          ) : filteredProducts.length > 0 ? (
            <ProductList products={filteredProducts} />
          ) : (
            <NoResults>
              <h3>No Products Found</h3>
              {searchQuery && (
                <p>No results found for "{searchQuery}". Try a different search term or browse our trendy categories.</p>
              )}
            </NoResults>
          )}
        </div>
      </Section>

      <ContactSection />
    </HomeWrapper>
  );
}

export default Home;