import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import LoginModal from './Auth/LoginModal';
import SideCart from './SideCart/SideCart';

function Header() {
  const { getCartItemsCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { user, logout, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSideCart, setShowSideCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowSearch(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
      setShowMobileMenu(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setShowMobileMenu(false);
    } catch (error) {
      showNotification('Error logging out', 'error');
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${isScrolled ? 'shadow-md' : ''}`}>
      {/* Top Banner */}
      <div className="bg-black text-white py-2 px-4 text-center">
        <p className="text-xs md:text-sm truncate">
          Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!{' '}
          <a href="#" className="underline font-semibold hover:text-primary-200">ShopNow</a>
        </p>
      </div>

      {/* Main Header */}
      <header className={`bg-white/95 backdrop-blur-sm transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-full flex items-center justify-center transform hover:rotate-12 transition-transform">
                <i className="fas fa-fire text-white text-lg md:text-xl"></i>
              </div>
              <span className="text-lg md:text-xl font-bold">Exclusive</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/products" className="nav-link">Our Products</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              <Link to="/about" className="nav-link">About</Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4 md:space-x-6">
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="hidden md:block relative">
                <input
                  type="search"
                  placeholder="Search for products..."
                  className="w-48 lg:w-64 px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <i className="fas fa-search"></i>
                </button>
              </form>

              {/* Mobile Search Toggle */}
              <button 
                className="md:hidden text-gray-700 hover:text-primary-600"
                onClick={() => setShowSearch(!showSearch)}
              >
                <i className="fas fa-search text-xl"></i>
              </button>

              {/* Icons */}
              <Link to="/wishlist" className="relative text-gray-700 hover:text-primary-600">
                <i className="far fa-heart text-xl"></i>
                {getWishlistCount() > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center animate-pulse">
                    {getWishlistCount()}
                  </span>
                )}
              </Link>

              <button 
                onClick={() => setShowSideCart(true)} 
                className="relative text-gray-700 hover:text-primary-600"
              >
                <i className="fas fa-shopping-cart text-xl"></i>
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center animate-pulse">
                    {getCartItemsCount()}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative hidden md:block">
                  <button 
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                  >
                    <span className="hidden lg:block">{user?.name?.split(' ')[0]}</span>
                    <i className="fas fa-user-circle text-xl"></i>
                  </button>
                </div>
              ) : (
                <div className="hidden md:block">
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden text-gray-700 hover:text-primary-600"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'} text-xl`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <div className="md:hidden mt-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="search"
                  placeholder="Search for products..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t mt-4">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <Link to="/" className="block text-gray-700 hover:text-primary-600">Home</Link>
              <Link to="/products" className="block text-gray-700 hover:text-primary-600">Our Products</Link>
              <Link to="/contact" className="block text-gray-700 hover:text-primary-600">Contact</Link>
              <Link to="/about" className="block text-gray-700 hover:text-primary-600">About</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block text-gray-700 hover:text-primary-600">My Profile</Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left text-red-600 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setShowLoginModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-left text-primary-600 hover:text-primary-700"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            showNotification('Logged in successfully!', 'success');
          }}
        />
      )}

      <SideCart
        isOpen={showSideCart}
        onClose={() => setShowSideCart(false)}
      />
    </div>
  );
}

// Add these styles to your CSS
const styles = `
.nav-link {
  position: relative;
  color: #4B5563;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #4F46E5;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #4F46E5;
  transition: width 0.2s;
}

.nav-link:hover::after {
  width: 100%;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.animate-pulse {
  animation: pulse 2s infinite;
}
`;

export default Header;