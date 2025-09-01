// src/contexts/WishlistContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from '../components/Notification/NotificationProvider';
import { useAuth } from './AuthContext';
import api from '../api/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    const savedWishlist = localStorage.getItem('guestWishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();

  const loadAuthenticatedWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.getUserWishlist();
      if (response?.wishlist) {
        setWishlistItems(response.wishlist);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Handle wishlist synchronization
  useEffect(() => {
    if (!isAuthenticated) {
      const savedWishlist = localStorage.getItem('guestWishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    }
  }, [isAuthenticated]);

  // Save guest wishlist to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('guestWishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated]);

  const addToWishlist = useCallback(async (product) => {
    if (!product?._id) return;
    
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        const response = await api.addToWishlist(product._id);
        if (response?.wishlist) {
          setWishlistItems(response.wishlist);
        }
      } else {
        setWishlistItems(prev => {
          if (prev.some(item => item._id === product._id)) {
            return prev;
          }
          return [...prev, product];
        });
      }
      
      showNotification('Added to wishlist', 'success');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showNotification('Failed to add to wishlist', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showNotification]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        const response = await api.removeFromWishlist(productId);
        if (response?.wishlist) {
          setWishlistItems(response.wishlist);
        }
      } else {
        setWishlistItems(prev => prev.filter(item => item._id !== productId));
      }

      showNotification('Removed from wishlist', 'success');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showNotification('Failed to remove from wishlist', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showNotification]);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item._id === productId);
  }, [wishlistItems]);

  // Merge wishlists after login
  useEffect(() => {
    const mergeWishlists = async () => {
      if (isAuthenticated && user) {
        const guestWishlist = localStorage.getItem('guestWishlist');
        if (guestWishlist) {
          try {
            const guestItems = JSON.parse(guestWishlist);
            for (const item of guestItems) {
              if (!isInWishlist(item._id)) {
                await api.addToWishlist(item._id);
              }
            }
            localStorage.removeItem('guestWishlist');
            await loadAuthenticatedWishlist();
          } catch (error) {
            console.error('Error merging wishlists:', error);
          }
        }
      }
    };

    mergeWishlists();
  }, [isAuthenticated, user, isInWishlist, loadAuthenticatedWishlist]);

  const contextValue = useMemo(() => ({
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount: () => wishlistItems.length,
    loading,
    reloadWishlist: loadAuthenticatedWishlist
  }), [
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading,
    loadAuthenticatedWishlist
  ]);

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;