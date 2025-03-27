// src/components/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import SideCart from './SideCart/SideCart';
import api from '../api/api';
import './Header.css';
import CategoryNavigator from './CategoryNavigator/CategoryNavigator';

function Header() {
  const { getCartItemsCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSideCart, setShowSideCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [bannerText, setBannerText] = useState(' ');
  const [showCategoryNav, setShowCategoryNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const bannerRef = useRef(null);

  // Add effect to fetch settings and get banner text
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.getSettings();
        if (response && response.bannerText) {
          setBannerText(response.bannerText);
        }
      } catch (error) {
        console.error('Error fetching banner text:', error);
      }
    };

    fetchSettings();
  }, []);

  // src/components/Header.js
  // Inside the component:

  useEffect(() => {
    // Add event listeners for cart control
    const handleOpenCart = () => {
      setShowSideCart(true);
    };

    const handleCloseCart = () => {
      setShowSideCart(false);
    };

    document.addEventListener('openSideCart', handleOpenCart);
    document.addEventListener('closeSideCart', handleCloseCart);

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('openSideCart', handleOpenCart);
      document.removeEventListener('closeSideCart', handleCloseCart);
    };
  }, []);

  // Handle scroll effect for styling changes
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Set isScrolled for header styling
      setIsScrolled(currentScrollY > 20);

      // Update category navigator visibility
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowCategoryNav(false);
      } else {
        setShowCategoryNav(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowSearch(false);
    setShowUserMenu(false);
  }, [location]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
      setShowMobileMenu(false);
    }
  };

  // Function to render banner text with ShopNow link
  const renderBannerText = () => {
    // If text already contains ShopNow, just return it as is
    if (bannerText.includes('ShopNow')) {
      return (
        <div className="flex items-center justify-center w-full">
          <span className="text-xs md:text-sm font-medium text-center">
            {bannerText.split('ShopNow').map((part, index, array) => {
              // If this is the last part, don't add the ShopNow link
              if (index === array.length - 1) return part;
              return (
                <React.Fragment key={index}>
                  {part}
                  <a href="spotlylb.com" className="underline font-semibold hover:opacity-80 transition-opacity duration-300">ShopNow</a>
                </React.Fragment>
              );
            })}
          </span>
        </div>
      );
    }

    // Otherwise, just show the text
    return (
      <div className="flex items-center justify-center w-full">
        <span className="text-xs md:text-sm font-medium text-center">{bannerText}</span>
      </div>
    );
  };

  return (
    <>
      {/* Complete Fixed Header Container */}
      <div className="fixed-header-container">
        {/* Purple Banner - Now part of the fixed header */}
        <div
          ref={bannerRef}
          style={{ backgroundColor: '#8c52ff' }}
          className="text-white py-1 px-4 top-banner"
        >
          <div className="container mx-auto flex justify-between items-center">
            {/* Social Media Links - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2">
              <a href="https://www.facebook.com/profile.php?id=61570963155100&mibextid=LQQJ4d" className="text-white hover:opacity-80 social-icon">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://www.instagram.com/spotlylb?igsh=Zng3NWhlc3c5ejRh&utm_source=qr" className="text-white hover:opacity-80 social-icon">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.tiktok.com/@spotlylb?_t=ZS-8uMGOEL8oOi&_r=1" className="text-white hover:opacity-80 social-icon">
                <i className="fab fa-tiktok"></i>
              </a>
              <span className="text-xs ml-1">Follow us!</span>
            </div>

            {/* Dynamic Banner Text from API */}
            <div className="flex-1 md:flex-none text-center">
              {renderBannerText()}
            </div>

            {/* Contact Text - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2">
              <a href="https://wa.me/96176919370?text=Hello!%20I'm%20interested%20in%20your%20products."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white hover:opacity-80 transition-all duration-300"
              >
                <span className="text-xs">Get in touch with us</span>
                <i className="fab fa-whatsapp text-lg text-white-400 whatsapp-icon"></i>
              </a>
            </div>

            {/* Empty div for mobile layout balance */}
            <div className="md:hidden"></div>
          </div>
        </div>

        {/* Main Header */}
        <div className="main-header bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* Logo - SMALLER SIZE */}
              <Link to="/" className="flex items-center space-x-2 -ml-1 logo-animation">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-8 w-auto"
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-6">
                <Link
                  to="/"
                  className="nav-link text-sm"
                  onClick={() => {
                    // Force navigation to home and reset state
                    window.location.href = '/';
                  }}
                >
                  Home
                </Link>
                <Link
                  to="/?scrollToProducts=true"
                  className="nav-link text-sm"
                >
                  Our Products
                </Link>
                <Link to="/contact" className="nav-link text-sm">Contact</Link>
                <Link to="/about" className="nav-link text-sm">About</Link>
              </nav>

              {/* Right Section */}
              <div className="flex items-center space-x-3 md:space-x-4">
                {/* Desktop Search */}
                <form onSubmit={handleSearch} className="hidden md:block relative">
                  <input
                    type="search"
                    placeholder="Search for products..."
                    className="w-40 lg:w-56 px-3 py-1 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors duration-300">
                    <i className="fas fa-search text-xs"></i>
                  </button>
                </form>

                {/* Mobile Search Toggle */}
                <button
                  className="md:hidden text-gray-700 hover:text-purple-600 transition-colors duration-300 icon-button"
                  onClick={() => setShowSearch(!showSearch)}
                  aria-label="Search"
                >
                  <i className="fas fa-search text-lg"></i>
                </button>

                {/* Icons */}
                <Link to="/wishlist" className="relative text-gray-700 hover:text-purple-600 transition-colors duration-300 icon-button" aria-label="Wishlist">
                  <i className="far fa-heart text-lg"></i>
                  {getWishlistCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center badge-animation">
                      {getWishlistCount()}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setShowSideCart(true)}
                  className="relative text-gray-700 hover:text-purple-600 transition-colors duration-300 icon-button"
                  aria-label="Cart"
                >
                  <i className="fas fa-shopping-cart text-lg"></i>
                  {getCartItemsCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center badge-animation">
                      {getCartItemsCount()}
                    </span>
                  )}
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  className="lg:hidden text-gray-700 hover:text-purple-600 transition-colors duration-300 icon-button"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  aria-label="Toggle menu"
                >
                  <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'} text-lg`}></i>
                </button>
              </div>
            </div>

            {/* Mobile Search Bar */}
            {showSearch && (
              <div className="md:hidden mt-2 pb-2 dropdown-animation">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="search"
                    placeholder="Search for products..."
                    className="w-full px-3 py-1 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors duration-300">
                    <i className="fas fa-search text-xs"></i>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Mobile Menu - COMPACT */}
          {showMobileMenu && (
            <div className="lg:hidden border-t mt-1 mobile-menu-animation">
              <nav className="container mx-auto px-4 py-2 space-y-2">
                <Link to="/" className="block text-sm text-gray-700 hover:text-purple-600 hover:pl-2 mobile-nav-link py-1">Home</Link>
                <Link
                  to="/?scrollToProducts=true"
                  className="block text-sm text-gray-700 hover:text-purple-600 hover:pl-2 mobile-nav-link py-1"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Our Products
                </Link>
                <Link to="/contact" className="block text-sm text-gray-700 hover:text-purple-600 hover:pl-2 mobile-nav-link py-1">Contact</Link>
                <Link to="/about" className="block text-sm text-gray-700 hover:text-purple-600 hover:pl-2 mobile-nav-link py-1">About</Link>
              </nav>
            </div>
          )}
        </div>

        {/* Category Navigator */}
        <div
          className={`category-nav-section ${showCategoryNav ? 'visible' : 'hidden'}`}
        >
          <CategoryNavigator hideArrows={true} />
        </div>
      </div>

      {/* Spacer to prevent content jumps */}
      <div className="header-spacer"></div>

      {/* Modals */}
      <SideCart
        isOpen={showSideCart}
        onClose={() => setShowSideCart(false)}
      />
    </>
  );
}

export default Header;