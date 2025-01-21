import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from './Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';
import DiscountTimer from './DiscountTimer';
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.soldOut) {
      showNotification('This product is sold out', 'error');
      return;
    }

    addToCart(product);
    //showNotification(`Added ${product.name} to cart!`, 'success');
  };

  return (
    <Link to={`/product/${product._id}`} className="text-decoration-none">
      <div className="card h-100 product-card position-relative overflow-hidden shadow-sm">
        {/* Status Overlays */}
        {product.soldOut && (
          <div
            className="position-absolute w-100 h-100"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <div className="badge bg-danger px-3 py-2" style={{ fontSize: '1.1rem' }}>
              <i className="fas fa-times-circle me-2"></i>
              Sold Out
            </div>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div
            className="position-absolute start-0 top-0 m-2 py-1 px-2 bg-danger text-white"
            style={{
              zIndex: 3,
              borderRadius: '0 0 4px 0',
              fontSize: '0.9rem'
            }}
          >
            <i className="fas fa-tag me-1"></i>
            Save ${(originalPrice - currentPrice).toFixed(2)}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          className={`position-absolute end-0 top-0 m-2 btn btn-light rounded-circle p-2 ${isWishlisted ? 'shadow' : ''}`}
          onClick={handleWishlistClick}
          style={{ zIndex: 5, width: '35px', height: '35px' }}
        >
          <i className={`fas fa-heart ${isWishlisted ? 'text-danger' : 'text-secondary'}`}></i>
        </button>

        {/* Product Image Section */}
        <div className="product-image-container position-relative bg-light">
          <img
            src={getImageUrl(product.images[currentImageIndex])}
            className="card-img-top"
            alt={product.name}
            style={{ height: '220px', objectFit: 'contain', padding: '10px' }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300';
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

              {/* Image Dots */}
              <div className="image-dots position-absolute bottom-0 start-50 translate-middle-x mb-2">
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

        {/* Product Details <span className="badge bg-light text-dark border">{product.category}</span>*/}
        <div className="card-body d-flex flex-column">
          <div className="mb-2">
            <h5 className="card-title mb-1 text-dark" style={{ fontSize: '1.1rem' }}>{product.name}</h5>

          </div>


          {/* Price Section */}
          <div className="mb-3">
            {hasDiscount ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-danger fw-bold h5 mb-0">
                  ${currentPrice.toFixed(2)}
                </span>
                <span className="text-decoration-line-through text-muted small">
                  ${originalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="fw-bold text-dark h5 mb-0">
                ${currentPrice.toFixed(2)}
              </span>

            )}
          </div>


          {/* Action Buttons */}
          <div className="mt-auto d-grid gap-2">
            <button
              onClick={handleAddToCart}
              className={`btn ${product.soldOut ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              disabled={product.soldOut}
            >
              <i className={`fas ${product.soldOut ? 'fa-ban' : 'fa-shopping-cart'} me-2`}></i>
              {product.soldOut ? 'Sold Out' : 'Add to Cart'}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const message = encodeURIComponent(`Hi! I'm interested in buying ${product.name}`);
                window.open(`https://wa.me/96178934833?text=${message}`, '_blank');
              }}
              className={`btn ${product.soldOut ? 'btn-secondary' : 'btn-success'} btn-sm`}
              disabled={product.soldOut}
            >
              <i className="fab fa-whatsapp me-2"></i>
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