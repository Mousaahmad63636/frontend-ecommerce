// src/components/ProductItem.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { getImageUrl } from '../utils/imageUtils';

function ProductItem({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product._id);

  // Create discount badge (matches exact styling from image)
  const renderDiscountBadge = () => {
    if (product.discountPercentage > 0) {
      let discountText = '';
      if (product.discountType === 'fixed') {
        discountText = `$${product.discountPercentage.toFixed(2)} OFF`;
      } else {
        discountText = `-${product.discountPercentage}%`;
      }
      
      return (
        <div className="absolute top-3 left-3 bg-red-500 text-white font-semibold text-sm px-3 py-1 rounded z-10">
          {discountText}
        </div>
      );
    }
    return null;
  };

  // Calculate appropriate rating stars (exactly as in the image)
  const renderRatingStars = () => {
    const rating = Math.round(product.rating || 0);
    const fullStars = [...Array(5)].map((_, index) => (
      <span key={index} className={index < rating ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
    
    return (
      <div className="flex items-center">
        <div className="flex text-xl">{fullStars}</div>
        <span className="text-gray-500 ml-2">({product.reviewCount || 0})</span>
        <span className="ml-4 text-gray-500">REVIEW</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-none overflow-hidden relative">
      {/* Discount Badge */}
      {renderDiscountBadge()}
      
      {/* Wishlist Heart Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product);
        }}
        className="absolute top-3 right-3 z-10 w-12 h-12 bg-gray-200 bg-opacity-80 rounded-full flex items-center justify-center"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill={isWishlisted ? "black" : "none"} 
          stroke="black" 
          strokeWidth="2" 
          className="transition-all duration-300"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative bg-gray-100 aspect-square overflow-hidden">
          <img
            src={product.images && product.images.length > 0 
              ? getImageUrl(product.images[currentImageIndex]) 
              : '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-contain transition-all duration-300"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
        </div>
      </Link>
      
      {/* Product Details */}
      <div className="p-4">
        {/* Product Name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-xl font-medium text-black mb-2">{product.name}</h3>
        </Link>
        
        {/* Price */}
        <div className="flex items-center mb-3">
          <span className="text-xl font-bold text-red-500">${product.price.toFixed(0)}</span>
          {product.discountPercentage > 0 && (
            <span className="text-lg text-gray-500 line-through ml-2">${product.originalPrice.toFixed(0)}</span>
          )}
        </div>
        
        {/* Rating Stars - Styled exactly like the image */}
        {renderRatingStars()}
      </div>
    </div>
  );
}

export default ProductItem;