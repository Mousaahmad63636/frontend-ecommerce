import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from './Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';
import './ProductItem.css';

function ProductItem({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, loading } = useWishlist();
  const { showNotification } = useNotification();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasDiscount = product.discountPercentage > 0;
  const hasActiveDiscount = hasDiscount && product.discountEndDate;
  const originalPrice = hasDiscount ? product.originalPrice : product.price;
  const currentPrice = product.price;
  const isWishlisted = isInWishlist(product._id);

  const handleImageChange = (direction) => {
    if (direction === 'next') {
      setCurrentImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      if (isWishlisted) {
        removeFromWishlist(product._id);
      } else {
        addToWishlist(product);
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
    }
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productUrl = `${window.location.origin}/product/${product._id}`;
    const imageUrl = getImageUrl(product.images[0]);
    
    const message = encodeURIComponent(
      `Check out this product: ${product.name}\n\n` +
      `${productUrl}\n\n` +
      `Price: $${currentPrice.toFixed(2)}`
    );
  
    window.open(
      `https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${message}`,
      '_blank'
    );
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.soldOut) {
      showNotification('This product is sold out', 'error');
      return;
    }

    addToCart(product);
  };

  return (
    <Link to={`/product/${product._id}`} className="text-decoration-none">
      <div className="card h-100 product-card position-relative overflow-hidden shadow-sm">
        {/* Status Overlays */}
        {product.soldOut && (
          <div className="sold-out-overlay">
            <div className="badge bg-danger px-2 py-1">
              <i className="fas fa-times-circle me-1"></i>
              Sold Out
            </div>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="discount-badge">
            <i className="fas fa-tag me-1"></i>
            Save ${(originalPrice - currentPrice).toFixed(2)}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistClick}
        >
          <i className={`fas fa-heart ${isWishlisted ? 'text-danger' : 'text-secondary'}`}></i>
        </button>

        {/* Product Image Section */}
        <div className="product-image-container">
          <img
            src={getImageUrl(product.images[currentImageIndex])}
            className="card-img-top"
            alt={product.name}
            onError={(e) => {
              e.target.src = 'https://placehold.co/300@3x.png';
            }}
          />

          {/* Image Navigation */}
          {product.images.length > 1 && (
            <>
              <div className="image-navigation">
                <button
                  className="nav-button prev"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageChange('prev');
                  }}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  className="nav-button next"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageChange('next');
                  }}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>

              <div className="image-dots">
                {product.images.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Details */}
        <div className="card-body">
          <h5 className="product-title">{product.name}</h5>

          <div className="price-section">
            {hasDiscount ? (
              <div className="d-flex align-items-center gap-2">
                <span className="current-price">${currentPrice.toFixed(2)}</span>
                <span className="original-price">${originalPrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="current-price">${currentPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleAddToCart}
              className={`btn ${product.soldOut ? 'btn-secondary' : 'btn-primary'} btn-sm w-100`}
              disabled={product.soldOut}
            >
              <i className={`fas ${product.soldOut ? 'fa-ban' : 'fa-shopping-cart'} me-1`}></i>
              {product.soldOut ? 'Sold Out' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWhatsAppClick}
              className={`btn ${product.soldOut ? 'btn-secondary' : 'btn-success'} btn-sm w-100`}
              disabled={product.soldOut}
            >
              <i className="fab fa-whatsapp me-1"></i>
              {product.soldOut ? 'Not Available' : 'Buy on WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

ProductItem.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    discountPercentage: PropTypes.number,
    discountEndDate: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    category: PropTypes.string.isRequired,
    soldOut: PropTypes.bool
  }).isRequired,
};

export default ProductItem;