// src/components/ProductItem.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from './Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';

function ProductItem({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState([]);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification } = useNotification();
  const imageRef = useRef(null);

  const isWishlisted = isInWishlist(product._id);
  const hasDiscount = product.discountPercentage > 0;
  
  // Calculate the dollar amount saved if there's a discount
  const savedAmount = hasDiscount ? (product.originalPrice - product.price).toFixed(2) : 0;

  // Preload all product images to ensure faster navigation
  useEffect(() => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const preloadedStatus = Array(product.images.length).fill(false);
      
      product.images.forEach((imageSrc, index) => {
        const img = new Image();
        img.src = getImageUrl(imageSrc);
        
        img.onload = () => {
          setImagesPreloaded(prev => {
            const newStatus = [...prev];
            newStatus[index] = true;
            return newStatus;
          });
        };
        
        img.onerror = () => {
          setImagesPreloaded(prev => {
            const newStatus = [...prev];
            newStatus[index] = false;
            return newStatus;
          });
        };
      });
    }
  }, [product.images]);

  // Reset image states when current image changes
  useEffect(() => {
    setIsImageLoaded(false);
    setHasImageError(false);
  }, [currentImageIndex]);

  // Helper function to get categories (handles both legacy and new format)
  const getProductCategories = () => {
    if (Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories;
    } else if (product.category) {
      return [product.category];
    }
    return [];
  };

  // Handle image load
  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setHasImageError(false);
  };

  // Handle image error
  const handleImageError = () => {
    setIsImageLoaded(false);
    setHasImageError(true);
  };

  // Helper to safely get current image URL
  const getCurrentImage = () => {
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
      return '/placeholder.jpg';
    }
    
    if (currentImageIndex >= 0 && currentImageIndex < product.images.length) {
      return product.images[currentImageIndex];
    }
    
    return product.images[0];
  };

  // Navigate to next image
  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.images || !Array.isArray(product.images) || product.images.length <= 1) {
      return;
    }
    
    setCurrentImageIndex(prevIndex => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Navigate to previous image
  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.images || !Array.isArray(product.images) || product.images.length <= 1) {
      return;
    }
    
    setCurrentImageIndex(prevIndex => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  // Directly select an image by index
  const selectImage = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (index >= 0 && index < (product.images?.length || 0)) {
      setCurrentImageIndex(index);
    }
  };

  // Get number of available product images
  const getImageCount = () => {
    if (!product.images || !Array.isArray(product.images)) {
      return 0;
    }
    return product.images.length;
  };

  return (
    <div className="group w-full bg-white rounded-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:shadow-md relative">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 text-xs font-medium z-10 rounded-full shadow-sm">
          Save ${savedAmount}
        </div>
      )}
      
      {/* Product Image Container */}
      <div className="relative w-full pt-[100%] bg-gray-50 overflow-hidden">
        <Link to={`/product/${product._id}`} className="absolute inset-0 flex items-center justify-center p-3">
          {/* Loading placeholder */}
          {!isImageLoaded && !hasImageError && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          )}
          
          {/* Actual product image */}
          <img
            ref={imageRef}
            src={getImageUrl(getCurrentImage())}
            alt={product.name}
            className={`max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
          
          {/* Fallback image for errors */}
          {hasImageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product);
          }}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors duration-300"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart ${isWishlisted ? 'text-red-500' : 'text-gray-700'}`}></i>
        </button>
        
        {/* Image Navigation Arrows - Only show if more than one image */}
        {getImageCount() > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-1 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-white/70 text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Previous image"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-white/70 text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Next image"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </>
        )}
        
        {/* Image Navigation Dots */}
        {getImageCount() > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                className={`h-1.5 transition-all duration-200 ${
                  idx === currentImageIndex ? 'w-4 bg-gray-800' : 'w-1.5 bg-gray-400 hover:bg-gray-600'
                } rounded-full`}
                onClick={(e) => selectImage(idx, e)}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-3 flex flex-col min-h-[120px]">
        <Link to={`/product/${product._id}`} className="block mb-1">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 hover:text-gray-700 transition-colors duration-200">{product.name}</h3>
        </Link>
        
        {/* Categories */}
        <div className="flex items-center mb-1.5 h-5 overflow-hidden">
          <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap">
            {getProductCategories().slice(0, 2).map((category, index) => (
              <Link 
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="inline-block text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-sm hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
            {getProductCategories().length > 2 && (
              <span className="text-xs text-gray-500 whitespace-nowrap">+{getProductCategories().length - 2}</span>
            )}
          </div>
        </div>
        
        {/* Price Section */}
        <div className="flex items-baseline mb-1">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-red-500 mr-1.5">${product.price.toFixed(2)}</span>
              <span className="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</span>
          )}
        </div>
        
        {/* Star Rating */}
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <i 
              key={star} 
              className={`${star <= Math.round(product.rating || 4) ? 'text-yellow-400 fas' : 'text-gray-300 far'} fa-star text-xs`}
            ></i>
          ))}
          <span className="ml-1 text-xs text-gray-500">
            ({product.reviewCount !== undefined ? product.reviewCount : 0})
          </span>
        </div>
        
        {/* Add to Cart Button */}
        <div className="mt-auto">
          <button
            onClick={() => {
              addToCart(product);
              showNotification('Added to cart', 'success');
            }}
            disabled={product.soldOut}
            className={`w-full py-1.5 rounded-full text-center text-sm font-medium transition-all duration-200 ${
              product.soldOut
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800 active:scale-95'
            }`}
          >
            {product.soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductItem;