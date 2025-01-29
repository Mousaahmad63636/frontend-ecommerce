import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import LoginModal from './Auth/LoginModal';
import SideCart from './SideCart/SideCart';
import {
  HeaderWrapper,
  HeaderContainer,
  Brand,
  SearchContainer,
  SearchInput,
  NavActions,
  IconButton,
  MobileMenuButton,
  MobileMenu,
  MobileSearch,
  MobileNavItem,
  ProfileDropdown,
  DropdownMenu,
  DropdownItem
} from '../styles/HeaderStyles';

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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setShowMobileMenu(false);
    setShowProfileDropdown(false);
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
      showNotification('Logged out successfully!', 'success');
      navigate('/');
    } catch (error) {
      showNotification('Error logging out', 'error');
    }
  };

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <Brand to="/">
          <i className="fas fa-store brand-icon"></i>
          <span>E-Shop</span>
        </Brand>

        <SearchContainer onSubmit={handleSearch}>
          <SearchInput>
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <i className="fas fa-search"></i>
            </button>
          </SearchInput>
        </SearchContainer>

        <NavActions>
          <IconButton as={Link} to="/wishlist">
            <i className="fas fa-heart"></i>
            {getWishlistCount() > 0 && (
              <span className="badge">{getWishlistCount()}</span>
            )}
            <span className="icon-label">Wishlist</span>
          </IconButton>

          <IconButton onClick={() => setShowSideCart(true)}>
            <i className="fas fa-shopping-cart"></i>
            {getCartItemsCount() > 0 && (
              <span className="badge">{getCartItemsCount()}</span>
            )}
            <span className="icon-label">Cart</span>
          </IconButton>

          {isAuthenticated ? (
            <ProfileDropdown>
              <IconButton onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                <i className="fas fa-user-circle"></i>
                <span className="icon-label">{user?.name?.split(' ')[0]}</span>
              </IconButton>

              {showProfileDropdown && (
                <DropdownMenu>
                  <div className="dropdown-header">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-email">{user?.email}</span>
                  </div>

                  <DropdownItem to="/profile">
                    <i className="fas fa-user"></i>
                    My Profile
                  </DropdownItem>

                  <DropdownItem to="/orders">
                    <i className="fas fa-shopping-bag"></i>
                    My Orders
                  </DropdownItem>

                  {user?.role === 'admin' && (
                    <DropdownItem to="/admin">
                      <i className="fas fa-user-shield"></i>
                      Admin Panel
                    </DropdownItem>
                  )}

                  <DropdownItem as="button" onClick={handleLogout} className="text-danger">
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              )}
            </ProfileDropdown>
          ) : (
            <IconButton onClick={() => setShowLoginModal(true)}>
              <i className="fas fa-user-circle"></i>
              <span className="icon-label">Sign in</span>
            </IconButton>
          )}
        </NavActions>

        <MobileMenuButton onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
        </MobileMenuButton>
      </HeaderContainer>

      {showMobileMenu && (
        <MobileMenu>
          <MobileSearch onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <i className="fas fa-search"></i>
            </button>
          </MobileSearch>

          <MobileNavItem to="/wishlist">
            <i className="fas fa-heart"></i>
            Wishlist
            {getWishlistCount() > 0 && (
              <span className="badge">{getWishlistCount()}</span>
            )}
          </MobileNavItem>

          {isAuthenticated ? (
            <>
              <MobileNavItem to="/profile">
                <i className="fas fa-user"></i>
                My Profile
              </MobileNavItem>
              <MobileNavItem to="/orders">
                <i className="fas fa-shopping-bag"></i>
                My Orders
              </MobileNavItem>
              {user?.role === 'admin' && (
                <MobileNavItem to="/admin">
                  <i className="fas fa-user-shield"></i>
                  Admin Panel
                </MobileNavItem>
              )}
              <MobileNavItem as="button" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </MobileNavItem>
            </>
          ) : (
            <MobileNavItem as="button" onClick={() => setShowLoginModal(true)}>
              <i className="fas fa-sign-in-alt"></i>
              Sign in
            </MobileNavItem>
          )}
        </MobileMenu>
      )}

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
    </HeaderWrapper>
  );
}

export default Header;