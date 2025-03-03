// src/components/ProductItem.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from './Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';

function ProductItem({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification } = useNotification();

  const isWishlisted = isInWishlist(product._id);
  const hasDiscount = product.discountPercentage > 0;
  
  // Calculate the dollar amount saved if there's a discount
  const savedAmount = hasDiscount ? (product.originalPrice - product.price).toFixed(2) : 0;

  // Helper function to get categories (handles both legacy and new format)
  const getProductCategories = () => {
    if (Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories;
    } else if (product.category) {
      return [product.category];
    }
    return [];
  };

  return (
    <div className="group w-full h-full bg-white rounded-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:shadow-md relative">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 text-2xs font-medium z-10 rounded-full shadow-sm">
          Save ${savedAmount}
        </div>
      )}
      
      {/* Product Image Container */}
      <div className="relative w-full pt-[100%] bg-gray-50 overflow-hidden">
        <Link to={`/product/${product._id}`} className="absolute inset-0 flex items-center justify-center p-3">
          <img
            src={product.images && product.images.length > 0 
              ? getImageUrl(product.images[currentImageIndex]) 
              : '/placeholder.jpg'}
            alt={product.name}
            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
        </Link>
        
        {/* Wishlist Button - Enlarged for better touch target */}
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
        
        {/* Image Navigation Dots - Improved visibility */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === currentImageIndex ? 'w-4 bg-gray-800' : 'w-1.5 bg-gray-400'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex(idx);
                }}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-3 flex flex-col h-[110px]">
        <Link to={`/product/${product._id}`} className="block mb-0.5">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 hover:text-gray-700 transition-colors duration-200">{product.name}</h3>
        </Link>
        
        {/* Categories - Limited to prevent overflow */}
        <div className="flex flex-wrap gap-1 mb-auto">
          {getProductCategories().slice(0, 2).map(category => (
            <Link 
              key={category}
              to={`/?category=${encodeURIComponent(category)}`}
              className="text-2xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-sm hover:bg-gray-200 transition-colors duration-200"
            >
              {category}
            </Link>
          ))}
          {getProductCategories().length > 2 && (
            <span className="text-2xs text-gray-500">+{getProductCategories().length - 2} more</span>
          )}
        </div>
        
        {/* Price Section */}
        <div className="mt-1 flex items-baseline">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-red-500 mr-1.5">${product.price.toFixed(2)}</span>
              <span className="text-2xs text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
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
          <span className="ml-1 text-2xs text-gray-500">
            ({product.reviewCount !== undefined ? product.reviewCount : 0})
          </span>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={() => {
            addToCart(product);
            showNotification('Added to cart!', 'success');
          }}
          disabled={product.soldOut}
          className={`w-full py-1.5 rounded-full text-center text-xs font-medium transition-all duration-200 ${
            product.soldOut
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800 active:scale-95'
          }`}
        >
          {product.soldOut ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default ProductItem;