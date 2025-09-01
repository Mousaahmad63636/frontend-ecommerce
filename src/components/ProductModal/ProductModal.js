// src/components/ProductModal/ProductModal.js
import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Heart, Share2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import RatingStars from '../RatingStars';
import cachedApi from '../../services/cachedApi';
import imageCacheService from '../../services/imageCacheService';
import './ProductModal.css';

const ProductModal = ({ 
  productId, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onToggleWishlist, 
  isInWishlist 
}) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);

  // Fetch product data when modal opens
  useEffect(() => {
    if (!isOpen || !productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await cachedApi.getProductById(productId);
        setProduct(data);
        
        // Preload product images
        if (data.images && data.images.length > 0) {
          imageCacheService.preloadImages(data.images);
        }
        
        // Set default selections
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
        
        // Fetch similar products
        const allProducts = await cachedApi.getProducts();
        const similar = allProducts
          .filter(p => p.id !== productId && p.category === data.category)
          .slice(0, 4);
        setSimilarProducts(similar);
        
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(0);
      setQuantity(1);
      setSelectedSize('');
      setSelectedColor('');
      setProduct(null);
      setError(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartItem = {
      ...product,
      quantity,
      selectedSize,
      selectedColor,
    };
    
    onAddToCart(cartItem);
  };

  const handleImageNavigation = (direction) => {
    if (!product?.images) return;
    
    if (direction === 'next') {
      setSelectedImage((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setSelectedImage((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Helmet>
        <title>{product ? `${product.name} - Just Trendy` : 'Product Details - Just Trendy'}</title>
        <meta name="description" content={product?.description || 'View product details'} />
      </Helmet>
      
      <div className="product-modal-overlay" onClick={onClose}>
        <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button 
            className="product-modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          {loading && (
            <div className="product-modal-loading">
              <div className="loading-spinner"></div>
              <p>Loading product details...</p>
            </div>
          )}

          {error && (
            <div className="product-modal-error">
              <p>{error}</p>
              <button onClick={onClose}>Close</button>
            </div>
          )}

          {product && !loading && (
            <div className="product-modal-body">
              {/* Product Images */}
              <div className="product-modal-images">
                <div className="main-image-container">
                  <img
                    src={product.images?.[selectedImage] || product.image || '/placeholder.jpg'}
                    alt={product.name}
                    className="main-product-image"
                  />
                  
                  {product.images && product.images.length > 1 && (
                    <>
                      <button
                        className="image-nav-btn prev"
                        onClick={() => handleImageNavigation('prev')}
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        className="image-nav-btn next"
                        onClick={() => handleImageNavigation('next')}
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>
                
                {product.images && product.images.length > 1 && (
                  <div className="image-thumbnails">
                    {product.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="product-modal-details">
                <div className="product-header">
                  <h1 className="product-title">{product.name}</h1>
                  <button
                    className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                    onClick={() => onToggleWishlist(product)}
                    aria-label="Add to wishlist"
                  >
                    <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="product-rating">
                  <RatingStars rating={product.rating || 4.5} />
                  <span className="rating-text">({product.reviewCount || 0} reviews)</span>
                </div>

                <div className="product-price">
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="original-price">${product.originalPrice}</span>
                  )}
                  <span className="current-price">${product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="discount-badge">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                <div className="product-description">
                  <p>{product.description}</p>
                </div>

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="product-options">
                    <label>Size:</label>
                    <div className="size-options">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="product-options">
                    <label>Color:</label>
                    <div className="color-options">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                          onClick={() => setSelectedColor(color)}
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="quantity-section">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="product-actions">
                  <button
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                  
                  <button
                    className="share-btn"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: product.name,
                          text: product.description,
                          url: window.location.href,
                        });
                      }
                    }}
                  >
                    <Share2 size={20} />
                    Share
                  </button>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                  <div className="similar-products">
                    <h3>Similar Products</h3>
                    <div className="similar-products-grid">
                      {similarProducts.map((similarProduct) => (
                        <div
                          key={similarProduct.id}
                          className="similar-product-item"
                          onClick={() => {
                            setProduct(null);
                            setLoading(true);
                            // This will trigger the useEffect to fetch the new product
                            setTimeout(() => {
                              // Update the productId prop would be handled by parent
                            }, 0);
                          }}
                        >
                          <img
                            src={similarProduct.image}
                            alt={similarProduct.name}
                          />
                          <p>{similarProduct.name}</p>
                          <span>${similarProduct.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductModal;
