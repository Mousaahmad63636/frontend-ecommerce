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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      showNotification('Error logging out', 'error');
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-black text-white py-2 px-4 text-center">
        <p className="text-sm">
          Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!{' '}
          <a href="#" className="underline font-semibold">ShopNow</a>
        </p>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <i className="fas fa-fire text-white"></i>
              </div>
              <span className="text-xl font-bold">Exclusive</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-600">Home</Link>
              <Link to="/products" className="text-gray-700 hover:text-primary-600">Our Products</Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary-600">Contact</Link>
              <Link to="/about" className="text-gray-700 hover:text-primary-600">About</Link>
              {!isAuthenticated && (
                <>
                  <button onClick={() => setShowLoginModal(true)} className="text-gray-700 hover:text-primary-600">
                    Log In
                  </button>
                  <Link to="/register" className="text-gray-700 hover:text-primary-600">Sign Up</Link>
                </>
              )}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-6">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:block">
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-64 px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {/* Icons */}
              <div className="flex items-center space-x-4">
                <Link to="/wishlist" className="relative text-gray-700 hover:text-primary-600">
                  <i className="far fa-heart text-xl"></i>
                  {getWishlistCount() > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                      {getWishlistCount()}
                    </span>
                  )}
                </Link>

                <button onClick={() => setShowSideCart(true)} className="relative text-gray-700 hover:text-primary-600">
                  <i className="fas fa-shopping-cart text-xl"></i>
                  {getCartItemsCount() > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                      {getCartItemsCount()}
                    </span>
                  )}
                </button>

                {isAuthenticated && (
                  <button onClick={handleLogout} className="text-gray-700 hover:text-primary-600">
                    <i className="fas fa-sign-out-alt text-xl"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
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
    </>
  );
}

export default Header;