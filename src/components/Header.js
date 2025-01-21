// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import LoginModal from './Auth/LoginModal';
import SideCart from './SideCart/SideCart';
import './Header.css';

function Header() {
  const { getCartItemsCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { user, logout, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSideCart, setShowSideCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowProfileDropdown(false);
    setShowSideCart(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      showNotification('Logged out successfully!', 'success');
      navigate('/');
    } catch (error) {
      showNotification('Error logging out', 'error');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileMenu(false); // Close mobile menu if open
    }
  };

  const handleProfileClick = () => {
    navigate('/profile'); // This ensures clicking profile always goes to profile page
  };

  const handleWishlistClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      showNotification('Please login to view your wishlist', 'info');
      setShowLoginModal(true);
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    setShowSideCart(true);
  };

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="brand">
          <i className="fas fa-store brand-icon"></i>
          <span className="brand-name">E-Shop</span>
        </Link>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-container">
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>

        <nav className="nav-icons">
          <Link
            to="/wishlist"
            className="nav-icon"
          >
            <div className="icon-container">
              <i className="fas fa-heart"></i>
              {getWishlistCount() > 0 && (
                <span className="badge wishlist-badge">
                  {getWishlistCount()}
                </span>
              )}
            </div>
            <span className="icon-label">Wishlist</span>
          </Link>

          <button
            className="nav-icon cart-button"
            onClick={handleCartClick}
          >
            <div className="icon-container">
              <i className="fas fa-shopping-cart"></i>
              {getCartItemsCount() > 0 && (
                <span className="badge cart-badge">
                  {getCartItemsCount()}
                </span>
              )}
            </div>
            <span className="icon-label">Cart</span>
          </button>

          {isAuthenticated ? (
            <div className="profile-dropdown">
              <button
                className="nav-icon profile-button"
                onClick={handleProfileClick}  // Ensure this handler is defined
                aria-label="Profile"
              >
                <div className="icon-container">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="profile-image"
                    />
                  ) : (
                    <i className="fas fa-user-circle"></i>
                  )}
                </div>
                <span className="icon-label">
                  {user?.name?.split(' ')[0] || 'Profile'}
                </span>
              </button>

              {showProfileDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-email">{user?.email}</span>
                  </div>

                  <Link to="/profile" className="dropdown-item">
                    <i className="fas fa-user"></i>
                    My Profile
                  </Link>

                  <Link to="/orders" className="dropdown-item">
                    <i className="fas fa-shopping-bag"></i>
                    My Orders
                  </Link>

                  <Link to="/wishlist" className="dropdown-item">
                    <i className="fas fa-heart"></i>
                    Wishlist
                  </Link>

                  {user?.role === 'admin' && (
                    <>
                      <div className="dropdown-divider"></div>
                      <Link to="/admin" className="dropdown-item">
                        <i className="fas fa-user-shield"></i>
                        Admin Panel
                      </Link>
                    </>
                  )}

                  <div className="dropdown-divider"></div>

                  <button
                    onClick={handleLogout}
                    className="dropdown-item text-danger"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="login-button"
              onClick={() => setShowLoginModal(true)}
            >
              <i className="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </button>
          )}
        </nav>

        <button
          className="mobile-menu-button"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      {showMobileMenu && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>

          <nav className="mobile-nav">
            <Link
              to={isAuthenticated ? "/wishlist" : "#"}
              className="mobile-nav-item"
              onClick={handleWishlistClick}
            >
              <i className="fas fa-heart"></i>
              Wishlist
              {isAuthenticated && getWishlistCount() > 0 && (
                <span className="mobile-badge">{getWishlistCount()}</span>
              )}
            </Link>

            <button
              className="mobile-nav-item"
              onClick={handleCartClick}
            >
              <i className="fas fa-shopping-cart"></i>
              Cart
              {getCartItemsCount() > 0 && (
                <span className="mobile-badge">{getCartItemsCount()}</span>
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/profile" className="mobile-nav-item">
                  <i className="fas fa-user"></i>
                  Profile
                </Link>
                <Link to="/orders" className="mobile-nav-item">
                  <i className="fas fa-shopping-bag"></i>
                  Orders
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="mobile-nav-item">
                    <i className="fas fa-user-shield"></i>
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="mobile-nav-item text-danger"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </>
            ) : (
              <button
                className="mobile-nav-item"
                onClick={() => setShowLoginModal(true)}
              >
                <i className="fas fa-sign-in-alt"></i>
                Login
              </button>
            )}
          </nav>
        </div>
      )}

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
    </header>
  );
}

export default Header;