import React, { useState } from 'react';
import { Card, Badge } from 'flowbite-react';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../utils/imageUtils';

function ProductItem({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification } = useNotification();

  const isWishlisted = isInWishlist(product._id);
  const hasDiscount = product.discountPercentage > 0;

  return (
    <Card className="max-w-sm h-full hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        {/* Discount Badge */}
        {hasDiscount && (
          <Badge color="failure" className="absolute top-2 left-2 z-10">
            -{product.discountPercentage}%
          </Badge>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product);
          }}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm
            ${isWishlisted ? 'text-red-500' : 'text-gray-500'} hover:scale-110 transition-transform`}
        >
          <HeartIcon className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <img
          src={getImageUrl(product.images[currentImageIndex])}
          alt={product.name}
          className="object-cover w-full h-48 rounded-t-lg"
          onError={(e) => {
            e.target.src = 'https://placehold.co/300@3x.png';
          }}
        />

        {/* Image Navigation */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors
                  ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                onClick={() => setCurrentImageIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <h5 className="text-xl font-semibold tracking-tight text-gray-900 line-clamp-2">
          {product.name}
        </h5>

        <div className="flex items-center mt-2.5 mb-5">
          {/* Price Display */}
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
              showNotification('Added to cart!', 'success');
            }}
            disabled={product.soldOut}
            className={`flex items-center justify-center w-full px-4 py-2 rounded-lg
              ${product.soldOut 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700'} 
              text-white transition-colors`}
          >
            <ShoppingCartIcon className="w-5 h-5 mr-2" />
            {product.soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              window.open(`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}`, '_blank');
            }}
            className="flex items-center justify-center w-full px-4 py-2 text-white bg-green-500 
              hover:bg-green-600 rounded-lg transition-colors"
          >
            <i className="fab fa-whatsapp mr-2" />
            Buy on WhatsApp
          </button>
        </div>
      </div>
    </Card>
  );
}

export default ProductItem;