// src/pages/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import LoginModal from '../components/Auth/LoginModal';
import DiscountTimer from '../components/DiscountTimer';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { getImageUrl } from '../utils/imageUtils';

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (product) {
      setSubtotal(product.price * quantity);
    }
  }, [quantity, product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Helper function to get product categories (handles both legacy and new format)
  const getProductCategories = () => {
    if (!product) return [];
    
    if (Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories;
    } else if (product.category) {
      return [product.category];
    }
    return [];
  };

  const getQuantityOptions = (basePrice) => {
    const maxQty = 5;
    return Array.from({ length: maxQty }, (_, i) => {
      const qty = i + 1;
      const discount = qty > 1 ? (qty - 1) : 0;
      const totalPrice = (basePrice * qty) - discount;
      return {
        quantity: qty,
        price: totalPrice,
        originalPrice: basePrice * qty,
        savings: discount
      };
    });
  };

  const handleAddToCart = () => {
    const finalQuantity = selectedOption ? selectedOption.quantity : quantity;
    const finalPrice = selectedOption ? selectedOption.price / selectedOption.quantity : product.price;

    addToCart({
      ...product,
      price: finalPrice,
      subtotal: subtotal
    }, finalQuantity);

   // showNotification(`${finalQuantity} ${product.name}(s) added to cart!`, 'success');
  };

  const handleBuyOnWhatsApp = () => {
    const productUrl = window.location.href;
    const message = encodeURIComponent(`Hi! I'm interested in buying ${product.name}\n\nProduct Link: ${productUrl}`);
    window.open(`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleWishlistToggle = async () => {
    try {
      const isProductInWishlist = isInWishlist(product._id);
      if (isProductInWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${product.name} on our store!`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        showNotification('Link copied to clipboard!', 'success');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">Product not found</div>
      </div>
    );
  }

  const hasDiscount = product.discountPercentage > 0;
  const hasActiveDiscount = hasDiscount && product.discountEndDate;
  const originalPrice = hasDiscount ? product.originalPrice : product.price;
  const currentPrice = product.price;
  const isWishlisted = isInWishlist(product._id);
  const quantityOptions = getQuantityOptions(product.price);
  return (
    <>
      <Helmet>
        <title>{product.name} - Spotlylb Store</title>
        
        {/* Essential OpenGraph Meta Tags */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={getImageUrl(product.images[0])} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:site_name" content="Spotlylb Store" />

        {/* Product specific meta tags */}
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="USD" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="product" />
        <meta name="twitter:title" content={product.name} />
        <meta name="twitter:description" content={product.description} />
        <meta name="twitter:image" content={getImageUrl(product.images[0])} />
      </Helmet>
    
    
    <div className="container mt-4">
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="btn btn-link text-dark p-0 mb-2" style={{ fontSize: '1.25rem' }}>
            <i className="fas fa-arrow-left me-2"></i>
            Go Back
          </button>

          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="/">Home</a></li>
              <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
            </ol>
          </nav>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="position-relative mb-3">
              {product.soldOut && (
                <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 3,
                    top: 0,
                    left: 0
                  }}>
                  <h2 className="text-white bg-danger px-4 py-2 rounded">Sold Out</h2>
                </div>
              )}

              {hasDiscount && (
                <div className="position-absolute start-0 top-0 m-2 p-2 bg-white rounded shadow-sm" style={{ zIndex: 2 }}>
                  <div className="d-flex flex-column">
                    <span className="text-danger fw-bold">${subtotal.toFixed(2)}</span>
                    <span className="text-decoration-line-through text-muted small">
                      ${(product.originalPrice * quantity).toFixed(2)}
                    </span>
                    <span className="text-success small">
                      Save ${((product.originalPrice * quantity) - subtotal).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                className={`btn position-absolute top-0 end-0 m-2 ${isWishlisted ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={handleWishlistToggle}
                style={{ zIndex: 4 }}
              >
                <i className="fas fa-heart"></i>
              </button>

              <div className="main-image-container">
                <img
                  src={getImageUrl(product.images[selectedImageIndex])}
                  alt={product.name}
                  className="img-fluid rounded main-product-image"
                  style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/500@3x.png';
                  } } />
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      className="carousel-control prev"
                      onClick={() => setSelectedImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1
                      )}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      className="carousel-control next"
                      onClick={() => setSelectedImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1
                      )}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </>
                )}
              </div>

              <div className="d-flex gap-2 mt-3 thumbnail-container">
                {product.images && product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail-wrapper ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="img-thumbnail"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/60@3x.png';
                      } } />
                  </div>
                ))}
              </div>

              <div className="share-buttons mt-3">
                <h6>Share this Product</h6>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-dark" onClick={() => handleShare('facebook')}>
                    <i className="fab fa-facebook-f"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-dark" onClick={() => handleShare('twitter')}>
                    <i className="fab fa-twitter"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-dark" onClick={() => handleShare('whatsapp')}>
                    <i className="fab fa-whatsapp"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-dark" onClick={() => handleShare('copy')}>
                    <i className="fas fa-link"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <h1 className="mb-3">{product.name}</h1>

            {/* Product Categories */}
            {getProductCategories().length > 0 && (
              <div className="mb-3">
                <div className="d-flex flex-wrap gap-2">
                  {getProductCategories().map(category => (
                    <a 
                      key={category} 
                      href={`/?category=${encodeURIComponent(category)}`}
                      className="badge bg-light text-dark text-decoration-none"
                    >
                      {category}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {product.soldOut && (
              <div className="mb-3">
                <span className="badge bg-danger fs-5">Sold Out</span>
              </div>
            )}

            <div className="mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Description</h5>
                  <p className="card-text">{product.description}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-center gap-2">
                <h2 className="text-danger mb-0">${subtotal.toFixed(2)}</h2>
                {hasDiscount && (
                  <>
                    <span className="text-decoration-line-through text-muted">
                      ${(product.originalPrice * quantity).toFixed(2)}
                    </span>
                    <span className="badge bg-danger">
                      Save ${((product.originalPrice * quantity) - subtotal).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Quantity:</label>
              <div className="input-group" style={{ width: '150px' }}>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.soldOut}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <input
                  type="number"
                  className="form-control text-center"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  disabled={product.soldOut} />
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.soldOut}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div className="d-grid gap-2 mb-4">
              <button
                className={`btn ${product.soldOut ? 'btn-secondary' : 'btn-danger'} btn-lg`}
                onClick={handleAddToCart}
                disabled={product.soldOut}
              >
                {product.soldOut ? 'Sold Out' : 'Add to Cart'}
              </button>
              <button
                className={`btn ${product.soldOut ? 'btn-secondary' : 'btn-success'} btn-lg`}
                onClick={handleBuyOnWhatsApp}
                disabled={product.soldOut}
              >
                <i className="fab fa-whatsapp me-2"></i>
                {product.soldOut ? 'Not Available' : 'Buy on WhatsApp'}
              </button>
            </div>

            {user && (
              <div className="alert alert-light border mb-4">
                <p className="mb-1">By purchasing this item, loyalty members will earn points</p>
                <button className="btn btn-link p-0">Login to earn points</button>
              </div>
            )}

            {hasActiveDiscount && (
              <div className="text-center mb-4">
                <h5>Sale Ends In:</h5>
                <DiscountTimer
                  endDate={product.discountEndDate}
                  onExpire={() => {
                    showNotification('The discount has expired', 'info');
                    window.location.reload();
                  } } />
              </div>
            )}

            <div className="text-center">
              <span className="badge bg-light text-dark border p-2">
                ℒℇ Cash On Delivery Checkout
              </span>
            </div>
          </div>
        </div>

        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSuccess={() => setShowLoginModal(false)} />
        )}
      </div></>
  );
}

export default ProductDetail;