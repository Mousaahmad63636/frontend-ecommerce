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

  return (
    <div className="product-card bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md relative">
      {/* Discount Badge - Now showing dollar amount saved */}
      {hasDiscount && (
        <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-sm font-medium z-10">
          Save ${savedAmount}
        </div>
      )}
      
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images && product.images.length > 0 
              ? getImageUrl(product.images[currentImageIndex]) 
              : '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
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
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white"
        >
          <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart ${isWishlisted ? 'text-red-500' : 'text-gray-700'}`}></i>
        </button>
        
        {/* Image Navigation Dots */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentImageIndex ? 'bg-gray-800 w-4' : 'bg-gray-400'
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
      <div className="p-4">
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1 mb-2">{product.name}</h3>
        </Link>
        
        <div className="flex items-baseline mb-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold text-red-500 mr-2">${product.price.toFixed(2)}</span>
              <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
          )}
        </div>
        
        {/* Star Rating */}
        <div className="flex items-center mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <i 
              key={star} 
              className={`${star <= (product.rating || 4) ? 'text-yellow-400 fas' : 'text-gray-300 far'} fa-star text-sm`}
            ></i>
          ))}
          <span className="ml-2 text-xs text-gray-500">
            ({product.reviews || Math.floor(Math.random() * 100) + 10})
          </span>
          <span className="ml-auto text-xs text-gray-500 uppercase">REVIEW</span>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={() => {
            addToCart(product);
            showNotification('Added to cart!', 'success');
          }}
          disabled={product.soldOut}
          className={`w-full py-2 rounded-full text-center ${
            product.soldOut
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
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