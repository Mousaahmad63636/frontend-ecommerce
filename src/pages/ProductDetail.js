import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import api from '../api/api';
import { formatPrice } from '../utils/formatters';
import { getImageUrl } from '../utils/imageUtils';
import DiscountTimer from '../components/DiscountTimer/DiscountTimer';
import Loading from '../components/Loading/Loading';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification } = useNotification();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        setProduct(data);
        fetchSimilarProducts(data.category);
      } catch (error) {
        console.error('Error fetching product:', error);
        showNotification('Error loading product', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, showNotification]);

  // Fetch similar products
  const fetchSimilarProducts = async (category) => {
    if (!category) return;
    
    try {
      setLoadingSimilar(true);
      const products = await api.getProducts();
      const filtered = products
        .filter(p => p.category === category && p._id !== id)
        .slice(0, 4);
      setSimilarProducts(filtered);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Handle quantity changes
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // Update quantity from input field
  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 10) {
      setQuantity(value);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, quantity);
    showNotification(`Added ${quantity} ${product.name} to cart`, 'success');
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      showNotification('Removed from wishlist', 'success');
    } else {
      addToWishlist(product);
      showNotification('Added to wishlist', 'success');
    }
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    if (!product) return;
    
    const phoneNumber = '96173873187'; // Your business phone number
    const productUrl = window.location.href;
    const message = encodeURIComponent(
      `Hi! I'm interested in buying ${product.name}\n\nProduct Link: ${productUrl}`
    );
    
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  // Navigate to next/previous image
  const navigateImage = (direction) => {
    if (!product || !product.images || product.images.length <= 1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentImageIndex + 1) % product.images.length;
    } else {
      newIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
    }
    
    setCurrentImageIndex(newIndex);
  };

  // Handle direct image selection
  const selectImage = (index) => {
    if (index >= 0 && index < (product?.images?.length || 0)) {
      setCurrentImageIndex(index);
    }
  };

  // Format categories for display
  const getFormattedCategories = () => {
    if (!product) return [];
    
    if (Array.isArray(product.categories) && product.categories.length > 0) {
      return product.categories;
    }
    
    return product.category ? [product.category] : [];
  };

  // Check if product has a discount
  const hasDiscount = product && product.originalPrice && product.price < product.originalPrice;
  
  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (!hasDiscount) return 0;
    
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <Loading />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h2>Product not found</h2>
        <p className="mb-4">The product you are looking for may have been removed or is no longer available.</p>
        <Link to="/" className="btn btn-primary">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      {/* Add Helmet for dynamic OpenGraph metadata */}
      <Helmet>
        <title>{product.name} | Spotlylb</title>
        <meta name="description" content={product.description.substring(0, 160)} />
        
        {/* OpenGraph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={`${product.name} | Spotlylb`} />
        <meta property="og:description" content={product.description.substring(0, 160)} />
        <meta property="og:image" content={product.images && product.images.length > 0 
          ? getImageUrl(product.images[0]) 
          : 'https://spotlylb.com/placeholder.jpg'} />
        
        {/* Product specific metadata */}
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="USD" />
      </Helmet>

      <div className="container py-5">
        <div className="row">
          {/* Breadcrumbs */}
          <div className="col-12 mb-4">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={`/?category=${encodeURIComponent(product.category)}`}>
                    {product.category}
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {product.name}
                </li>
              </ol>
            </nav>
          </div>

          {/* Product Images */}
          <div className="col-md-6 mb-4">
            <div className="product-image-container position-relative">
              {hasDiscount && (
                <div className="discount-badge">
                  {getDiscountPercentage()}% OFF
                </div>
              )}
              
              <img
                src={product.images && product.images.length > 0 
                  ? getImageUrl(product.images[currentImageIndex]) 
                  : '/placeholder.jpg'}
                alt={product.name}
                className="img-fluid rounded"
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                }}
              />
              
              {product.images && product.images.length > 1 && (
                <>
                  {/* Image navigation arrows */}
                  <div className="image-navigation">
                    <button
                      className="nav-button"
                      onClick={() => navigateImage('prev')}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      className="nav-button"
                      onClick={() => navigateImage('next')}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                  
                  {/* Image thumbnails */}
                  <div className="image-thumbnails mt-3">
                    <div className="row g-2">
                      {product.images.map((image, index) => (
                        <div key={index} className="col-3">
                          <div
                            className={`thumbnail-wrapper ${currentImageIndex === index ? 'active' : ''}`}
                            onClick={() => selectImage(index)}
                          >
                            <img
                              src={getImageUrl(image)}
                              alt={`${product.name} thumbnail ${index + 1}`}
                              className="img-fluid rounded"
                              onError={(e) => {
                                e.target.src = '/placeholder.jpg';
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="col-md-6">
            <div className="product-info">
              <h1 className="product-title mb-3">{product.name}</h1>
              
              {/* Categories */}
              <div className="categories mb-3">
                {getFormattedCategories().map(category => (
                  <Link
                    key={category}
                    to={`/?category=${encodeURIComponent(category)}`}
                    className="badge bg-secondary me-2"
                  >
                    {category}
                  </Link>
                ))}
              </div>
              
              {/* Rating */}
              <div className="d-flex align-items-center mb-3">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <i
                      key={star}
                      className={`${star <= (product.rating || 4) ? 'fas' : 'far'} fa-star me-1 text-warning`}
                    ></i>
                  ))}
                </div>
                <span className="text-muted ms-2">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>
              
              {/* Price */}
              <div className="price-section mb-4">
                {hasDiscount ? (
                  <>
                    <span className="current-price fs-2 fw-bold text-danger me-2">
                      {formatPrice(product.price)}
                    </span>
                    <span className="original-price text-muted text-decoration-line-through fs-4">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="discount-badge ms-2 bg-danger text-white px-2 py-1 rounded-pill">
                      Save {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                ) : (
                  <span className="current-price fs-2 fw-bold">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              {/* Discount Timer */}
              {product.discountEndDate && new Date(product.discountEndDate) > new Date() && (
                <div className="mb-4">
                  <h5>Limited Time Offer:</h5>
                  <DiscountTimer endDate={product.discountEndDate} />
                </div>
              )}
              
              {/* Description */}
              <div className="description mb-4">
                <h5>Description</h5>
                <p>{product.description}</p>
              </div>
              
              {/* Quantity Selector */}
              <div className="quantity-section mb-4">
                <h5>Quantity:</h5>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    className="form-control text-center mx-2"
                    style={{ width: '60px' }}
                    value={quantity}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                  />
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="action-buttons">
                <div className="row g-2">
                  <div className="col">
                    <button
                      className="btn btn-primary btn-lg w-100"
                      onClick={handleAddToCart}
                      disabled={product.soldOut}
                    >
                      {product.soldOut ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                  <div className="col-auto">
                    <button
                      className={`btn btn-outline-danger btn-lg ${isInWishlist(product._id) ? 'active' : ''}`}
                      onClick={handleWishlistToggle}
                    >
                      <i className={`${isInWishlist(product._id) ? 'fas' : 'far'} fa-heart`}></i>
                    </button>
                  </div>
                </div>
                
                {/* Buy on WhatsApp button */}
                <div className="mt-3">
                  <button 
                    className="btn btn-success btn-lg w-100"
                    onClick={handleWhatsAppClick}
                  >
                    <i className="fab fa-whatsapp me-2"></i>
                    Buy on WhatsApp
                  </button>
                </div>
              </div>
              
              {/* Shipping Info */}
              <div className="mt-4 shipping-info">
                <div className="d-flex align-items-center mb-2">
                  <i className="fas fa-truck me-2 text-muted"></i>
                  <span>Fast delivery available</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <i className="fas fa-money-bill-wave me-2 text-muted"></i>
                  <span>Cash on delivery</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="fas fa-exchange-alt me-2 text-muted"></i>
                  <span>Easy returns within 7 days</span>
                </div>
              </div>
              
              {/* Stock Status */}
              <div className="mt-3">
                <span className={`badge ${product.soldOut ? 'bg-danger' : 'bg-success'}`}>
                  {product.soldOut ? 'Out of Stock' : 'In Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="similar-products mt-5">
            <h3 className="mb-4">You Might Also Like</h3>
            <div className="row">
              {similarProducts.map(similarProduct => (
                <div key={similarProduct._id} className="col-md-3 col-6 mb-4">
                  <div className="card h-100">
                    <Link to={`/product/${similarProduct._id}`}>
                      <img
                        src={similarProduct.images && similarProduct.images.length > 0 
                          ? getImageUrl(similarProduct.images[0]) 
                          : '/placeholder.jpg'}
                        alt={similarProduct.name}
                        className="card-img-top"
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                    </Link>
                    <div className="card-body">
                      <h5 className="card-title">{similarProduct.name}</h5>
                      <p className="card-text fw-bold">
                        {formatPrice(similarProduct.price)}
                      </p>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          addToCart(similarProduct);
                          showNotification(`Added ${similarProduct.name} to cart`, 'success');
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;