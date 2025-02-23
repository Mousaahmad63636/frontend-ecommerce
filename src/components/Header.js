import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, TextInput, Button, Dropdown } from 'flowbite-react';
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

  const [showSideCart, setShowSideCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setShowMobileMenu(false);
    setShowSideCart(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileMenu(false);
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
    <Navbar fluid className="fixed w-full z-50 border-b bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <i className="fas fa-store text-primary-600 text-2xl"></i>
          <span className="self-center text-xl font-semibold whitespace-nowrap">E-Shop</span>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <TextInput
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              rightIcon="search"
            />
          </div>
        </form>

        {/* Navigation Icons */}
        <div className="flex items-center space-x-4">
          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 hover:text-primary-600 transition-colors">
            <i className="fas fa-heart"></i>
            {getWishlistCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 
                rounded-full flex items-center justify-center">
                {getWishlistCount()}
              </span>
            )}
            <span className="sr-only">Wishlist</span>
          </Link>

          {/* Cart */}
          <button 
            onClick={() => setShowSideCart(true)}
            className="relative p-2 hover:text-primary-600 transition-colors"
          >
            <i className="fas fa-shopping-cart"></i>
            {getCartItemsCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 
                rounded-full flex items-center justify-center">
                {getCartItemsCount()}
              </span>
            )}
            <span className="sr-only">Cart</span>
          </button>

          {/* User Menu */}
          {isAuthenticated ? (
            <Dropdown
              label={
                <div className="flex items-center space-x-2">
                  <i className="fas fa-user-circle text-xl"></i>
                  <span className="hidden md:inline">{user?.name?.split(' ')[0]}</span>
                </div>
              }
              arrowIcon={false}
              inline
            >
              <Dropdown.Header>
                <span className="block text-sm font-medium">{user?.name}</span>
                <span className="block truncate text-sm">{user?.email}</span>
              </Dropdown.Header>
              <Dropdown.Item as={Link} to="/profile" icon="user">
                My Profile
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/orders" icon="shopping-bag">
                My Orders
              </Dropdown.Item>
              {user?.role === 'admin' && (
                <Dropdown.Item as={Link} to="/admin" icon="user-shield">
                  Admin Panel
                </Dropdown.Item>
              )}
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} icon="sign-out-alt">
                Sign out
              </Dropdown.Item>
            </Dropdown>
          ) : (
            <Button
              onClick={() => setShowLoginModal(true)}
              size="sm"
              gradientDuoTone="purpleToBlue"
            >
              Sign in
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          className="md:hidden ml-4"
          color="gray"
          pill
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
        </Button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-white border-t shadow-lg">
          <div className="p-4">
            <form onSubmit={handleSearch} className="mb-4">
              <TextInput
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                rightIcon="search"
              />
            </form>

            <div className="space-y-2">
              <Link
                to="/wishlist"
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-heart w-6"></i>
                <span>Wishlist</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <i className="fas fa-user w-6"></i>
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <i className="fas fa-shopping-bag w-6"></i>
                    <span>My Orders</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <i className="fas fa-user-shield w-6"></i>
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg w-full text-left text-red-600"
                  >
                    <i className="fas fa-sign-out-alt w-6"></i>
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg w-full text-left"
                >
                  <i className="fas fa-sign-in-alt w-6"></i>
                  <span>Sign in</span>
                </button>
              )}
            </div>
          </div>
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
    </Navbar>
  );
}

export default Header;