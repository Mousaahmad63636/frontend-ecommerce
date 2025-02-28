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
    <div className="product-card bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md relative border border-gray-100">
      {/* Discount Badge - Now showing dollar amount saved */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium z-10 rounded-full">
          Save ${savedAmount}
        </div>
      )}
      
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images && product.images.length > 0 
              ? getImageUrl(product.images[currentImageIndex]) 
              : '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-contain p-2 transition-transform hover:scale-105"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
        </Link>
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product);
          }}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white"
        >
          <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart ${isWishlisted ? 'text-red-500' : 'text-gray-700'} text-sm`}></i>
        </button>
        
        {/* Image Navigation Dots */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? 'bg-gray-800 w-3' : 'bg-gray-400'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex(idx);
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-3">
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
        </Link>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-2">
          {getProductCategories().map(category => (
            <Link 
              key={category}
              to={`/?category=${encodeURIComponent(category)}`}
              className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-sm hover:bg-gray-200"
            >
              {category}
            </Link>
          ))}
        </div>
        
        <div className="flex items-baseline mb-1.5">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-red-500 mr-2">${product.price.toFixed(2)}</span>
              <span className="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</span>
          )}
        </div>
        
        {/* Star Rating - Now using dynamic rating from product */}
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <i 
              key={star} 
              className={`${star <= (product.rating || 4) ? 'text-yellow-400 fas' : 'text-gray-300 far'} fa-star text-xs`}
            ></i>
          ))}
          <span className="ml-1 text-xs text-gray-500">
            ({product.reviewCount || 0})
          </span>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={() => {
            addToCart(product);
            showNotification('Added to cart!', 'success');
          }}
          disabled={product.soldOut}
          className={`w-full py-1.5 rounded-full text-center text-sm ${
            product.soldOut
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {product.soldOut ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default ProductItem;