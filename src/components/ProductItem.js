import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from './Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';

function ProductItem({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, loading } = useWishlist();
  const { showNotification } = useNotification();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasDiscount = product.discountPercentage > 0;
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
            <div className="badge bg-danger px-2 py-1 px-sm-3 py-sm-2" style={{ fontSize: '0.9rem' }}>
              <i className="fas fa-times-circle me-2"></i>
              Sold Out
            </div>
          </div>
        )}

        {hasDiscount && (
          <div
            className="position-absolute start-0 top-0 m-1 m-sm-2 py-1 px-2 bg-danger text-white"
            style={{
              zIndex: 3,
              borderRadius: '0 0 4px 0',
              fontSize: '0.8rem'
            }}
          >
            <i className="fas fa-tag me-1"></i>
            Save ${(originalPrice - currentPrice).toFixed(2)}
          </div>
        )}

        <button
          className={`position-absolute end-0 top-0 m-1 m-sm-2 btn btn-light rounded-circle p-1 p-sm-2 ${isWishlisted ? 'shadow' : ''}`}
          onClick={handleWishlistClick}
          style={{ zIndex: 5, width: '30px', height: '30px' }}
        >
          <i className={`fas fa-heart ${isWishlisted ? 'text-danger' : 'text-secondary'}`}></i>
        </button>

        <div className="product-image-container position-relative bg-light ratio ratio-1x1">
          <img
            src={getImageUrl(product.images[currentImageIndex])}
            className="card-img-top p-2"
            alt={product.name}
            style={{ objectFit: 'contain' }}
            onError={(e) => {
              e.target.src = 'https://placehold.co/300@3x.png';
            }}
          />

          {product.images.length > 1 && (
            <>
              <div className="image-navigation">
                <button
                  className="nav-button prev btn btn-light btn-xs p-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageChange('prev');
                  }}
                >
                  <i className="fas fa-chevron-left fs-6"></i>
                </button>
                <button
                  className="nav-button next btn btn-light btn-xs p-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageChange('next');
                  }}
                >
                  <i className="fas fa-chevron-right fs-6"></i>
                </button>
              </div>

              <div className="image-dots position-absolute bottom-0 start-50 translate-middle-x mb-1">
                {product.images.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                    style={{ width: '8px', height: '8px' }}
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

        <div className="card-body d-flex flex-column p-2 p-sm-3">
          <div className="mb-1">
            <h5 className="card-title mb-0 text-dark fs-6 fs-md-5">{product.name}</h5>
          </div>

          <div className="my-1">
            {hasDiscount ? (
              <div className="d-flex flex-wrap align-items-center gap-1">
                <span className="text-danger fw-bold fs-6">
                  ${currentPrice.toFixed(2)}
                </span>
                <span className="text-decoration-line-through text-muted fs-7">
                  ${originalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="fw-bold text-dark fs-6">
                ${currentPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-auto d-flex flex-column flex-sm-row gap-1">
            <button
              onClick={handleAddToCart}
              className={`btn ${product.soldOut ? 'btn-secondary' : 'btn-primary'} btn-sm flex-grow-1`}
              style={{ minWidth: '120px' }}
              disabled={product.soldOut}
            >
              <i className={`fas ${product.soldOut ? 'fa-ban' : 'fa-shopping-cart'} me-1`}></i>
              {product.soldOut ? 'Sold Out' : 'Cart'}
            </button>
            <button
              onClick={handleWhatsAppClick}
              className={`btn ${product.soldOut ? 'btn-secondary' : 'btn-success'} btn-sm flex-grow-1`}
              style={{ minWidth: '120px' }}
              disabled={product.soldOut}
            >
              <i className="fab fa-whatsapp me-1"></i>
              WhatsApp
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