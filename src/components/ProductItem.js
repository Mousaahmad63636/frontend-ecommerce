// components/ProductItem.js
import React, { useState } from 'react';
import { HeartIcon, ShoppingCartIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';

function ProductItem({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification } = useNotification();

  const isWishlisted = isInWishlist(product._id);
  const hasDiscount = product.discountPercentage > 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-xl shadow-sm 
      hover:shadow-lg transition-shadow duration-300 min-w-[280px] md:min-w-[300px]">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white 
            text-sm font-medium px-2 py-1 rounded-full">
            -{product.discountPercentage}% OFF
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product);
          }}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 
            backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
        >
          {isWishlisted ? (
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Product Image */}
        <img
          src={getImageUrl(product.images[currentImageIndex])}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 
            transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://placehold.co/300@3x.png';
          }}
        />

        {/* Image Navigation */}
        {product.images.length > 1 && (
          <>
            {/* Image Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200
                    ${idx === currentImageIndex ? 
                      'bg-white w-3' : 
                      'bg-white/60 hover:bg-white/80'}`}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>

            {/* Quick View Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
              transition-opacity flex items-center justify-center">
              <button
                className="bg-white/90 backdrop-blur-sm p-2 rounded-full 
                  transform translate-y-4 group-hover:translate-y-0 
                  transition-transform duration-300"
                onClick={(e) => e.preventDefault()}
              >
                <ArrowsRightLeftIcon className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-medium text-gray-900 line-clamp-2 mb-2">
          {product.name}
        </h3>

        <div className="flex items-baseline mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
              showNotification('Added to cart!', 'success');
            }}
            disabled={product.soldOut}
            className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center
              ${product.soldOut ? 
                'bg-gray-200 text-gray-500 cursor-not-allowed' : 
                'bg-primary-600 text-white hover:bg-primary-700'} 
              transition-colors duration-200`}
          >
            <ShoppingCartIcon className="w-5 h-5 mr-2" />
            {product.soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              window.open(`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}`, '_blank');
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-green-500 text-white 
              hover:bg-green-600 transition-colors duration-200 flex items-center justify-center"
          >
            <i className="fab fa-whatsapp text-lg mr-2" />
            Buy on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductItem;