// src/pages/ProductDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import api from '../api/api';
import { formatPrice } from '../utils/formatters';
import { getImageUrl } from '../utils/imageUtils';
import DiscountTimer from '../components/DiscountTimer/DiscountTimer';
import Loading from '../components/Loading/Loading';
import RatingStars from '../components/RatingStars';
import WhatsAppMetaTags from '../components/WhatsAppMetaTags';
import ProductList from '../components/ProductList';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification } = useNotification();
  const [userRating, setUserRating] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Handle back button click


  useEffect(() => {
    if (product) {
      console.log("Product data:", product);
      console.log("Has colors:", product.colors && product.colors.length > 0);
      console.log("Has sizes:", product.sizes && product.sizes.length > 0);
    }
  }, [product]);
  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle home button click
  const goToHome = () => {
    navigate('/'); // Go directly to homepage
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        setProduct(data);

        // Set default color and size if available
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }

        // Pass the complete product to fetchSimilarProducts instead of just the category
        fetchSimilarProducts(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        showNotification('Error loading product', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, showNotification]);

  // Updated fetchSimilarProducts to account for multiple categories
  const fetchSimilarProducts = async (currentProduct) => {
    if (!currentProduct) return;

    try {
      setLoadingSimilar(true);

      // Get all categories associated with the product (both primary and from categories array)
      const productCategories = new Set();

      // Add primary category
      if (currentProduct.category) {
        productCategories.add(currentProduct.category);
      }

      // Add all categories from the categories array if it exists
      if (Array.isArray(currentProduct.categories) && currentProduct.categories.length > 0) {
        currentProduct.categories.forEach(cat => {
          if (cat) productCategories.add(cat);
        });
      }

      // If no categories found, return
      if (productCategories.size === 0) {
        setLoadingSimilar(false);
        return;
      }

      // Convert Set to Array for easier use
      const categoriesArray = Array.from(productCategories);
      console.log('Looking for similar products in categories:', categoriesArray);

      const products = await api.getProducts();

      // Filter products that match any of the current product's categories
      const filtered = products.filter(p => {
        // Skip the current product
        if (p._id === currentProduct._id) return false;

        // Check if primary category matches any of our product's categories
        if (p.category && categoriesArray.includes(p.category)) return true;

        // Check if any category in the categories array matches
        if (Array.isArray(p.categories) && p.categories.length > 0) {
          return p.categories.some(cat => categoriesArray.includes(cat));
        }

        return false;
      });

      // Take only the first 10 matches instead of 4 for a better scrolling experience
      setSimilarProducts(filtered.slice(0, 10));
    } catch (error) {
      console.error('Error fetching similar products:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const containsArabic = (text) => {
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicPattern.test(text);
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

  const handleAddToCart = () => {
    if (!product) {
      showNotification('Product not available', 'error');
      return;
    }
  
    // Check if product has color options but none selected
    if (product.colors && product.colors.length > 0) {
      if (!selectedColor) {
        showNotification('Please select a color before adding to cart', 'error');
        return;
      }
    }
  
    // Check if product has size options but none selected
    if (product.sizes && product.sizes.length > 0) {
      if (!selectedSize) {
        showNotification('Please select a size before adding to cart', 'error');
        return;
      }
    }
  
    // Get validated values to pass to addToCart
    const colorToAdd = selectedColor || '';
    const sizeToAdd = selectedSize || '';
  
    // Log what we're adding to the cart (useful for debugging)
    console.log('Adding to cart:', {
      product: product.name,
      quantity,
      color: colorToAdd,
      size: sizeToAdd
    });
  
    // Add to cart with explicit color and size parameters
    addToCart(product, quantity, colorToAdd, sizeToAdd);
    
    // Show success notification
    let successMessage = `Added to cart: ${product.name}`;
    if (colorToAdd && sizeToAdd) {
      successMessage += ` (${colorToAdd}, ${sizeToAdd})`;
    } else if (colorToAdd) {
      successMessage += ` (${colorToAdd})`;
    } else if (sizeToAdd) {
      successMessage += ` (${sizeToAdd})`;
    }
    
    showNotification(successMessage, 'success');
  };
  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  // Handle rating change
  const handleRatingChange = (rating) => {
    setUserRating(rating);
    showNotification(`You rated this product ${rating} stars`, 'success');
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    if (!product) return;

    const phoneNumber = '96176919370';
    const productUrl = window.location.href;

    // Include color and size in the message if selected
    let colorInfo = selectedColor ? `\n *Selected Color:* ${selectedColor}` : '';
    let sizeInfo = selectedSize ? `\n *Selected Size:* ${selectedSize}` : '';

    // Add preview parameter to help WhatsApp recognize this is a product page
    const messageWithPreview = encodeURIComponent(
      `Hello! I want to buy the following product(s):\n *Product Name:* ${product.name} \n *Price:* ${product.price} $${colorInfo}${sizeInfo}\n *URL:* ${productUrl}?preview=true`
    );

    window.open(`https://wa.me/${phoneNumber}?text=${messageWithPreview}`, '_blank');
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

  // Calculate total price based on quantity
  const getTotalPrice = () => {
    if (!product) return 0;
    return product.price * quantity;
  };

  // Create view all URL for similar products
  const getViewAllUrl = () => {
    if (!product) return '/';

    // Gather all categories associated with the product
    const categories = [];

    // Add primary category
    if (product.category) {
      categories.push(product.category);
    }

    // Add all categories from the categories array if it exists
    if (Array.isArray(product.categories) && product.categories.length > 0) {
      product.categories.forEach(cat => {
        if (cat && !categories.includes(cat)) {
          categories.push(cat);
        }
      });
    }

    // If no categories found, return home
    if (categories.length === 0) return '/';

    // Use the first category for filtering and add product ID to context
    return `/?relatedTo=${encodeURIComponent(product._id)}&category=${encodeURIComponent(categories[0])}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <p className="mb-6 text-gray-600">The product you are looking for may have been removed or is no longer available.</p>
        <Link to="/" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition duration-200">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page bg-gray-50">
      {/* Add Helmet for dynamic OpenGraph metadata */}
      <WhatsAppMetaTags product={product} />
      <Helmet prioritizeSeoTags>
        <title>{product.name} | Spotlylb</title>
        <meta name="description" content={product.description.substring(0, 160)} />

        {/* Primary OpenGraph tags - ORDER IS IMPORTANT */}
        <meta property="og:title" content={product.name} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />

        {/* Image tags - This needs to come BEFORE description for WhatsApp */}
        <meta property="og:image" content={product.images && product.images.length > 0
          ? getImageUrl(product.images[0], true)
          : 'https://spotlylb.com/placeholder.jpg'} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={product.name} />

        {/* Description comes AFTER image */}
        <meta property="og:description" content={product.description.substring(0, 160)} />
        <meta property="og:site_name" content="Spotlylb" />

        {/* Product specific metadata */}
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="USD" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Single Back to Home Button - With added margin/padding for visibility */}
        <div className="mb-6 mt-14 pt-4"> {/* Added mt-14 (margin-top) and pt-4 (padding-top) */}
          <button
            onClick={goToHome}
            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 p-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100">

                <div className="relative aspect-square">
                  <img
                    src={product.images && product.images.length > 0
                      ? getImageUrl(product.images[currentImageIndex])
                      : '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                </div>

                {product.images && product.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                    <button
                      className="bg-white/80 backdrop-blur-sm text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-md pointer-events-auto hover:bg-white transition duration-200"
                      onClick={() => navigateImage('prev')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>
                    <button
                      className="bg-white/80 backdrop-blur-sm text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-md pointer-events-auto hover:bg-white transition duration-200"
                      onClick={() => navigateImage('next')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      className={`rounded-md overflow-hidden border-2 ${currentImageIndex === index
                        ? 'border-purple-500'
                        : 'border-transparent hover:border-gray-300'
                        } transition duration-200`}
                      onClick={() => selectImage(index)}
                    >
                      <div className="aspect-square">
                        <img
                          src={getImageUrl(image)}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-6 md:border-l border-gray-100">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-3">
                {getFormattedCategories().map(category => (
                  <Link
                    key={category}
                    to={`/?category=${encodeURIComponent(category)}`}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full transition duration-200"
                  >
                    {category}
                  </Link>
                ))}
              </div>

              {/* Product Rating */}
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= (product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price Section - All in a single row */}
              <div className="mb-6">
                {hasDiscount ? (
                  <div className="flex items-center flex-wrap">
                    {/* Current price - bold */}
                    <span className="text-3xl font-bold text-purple-600 mr-3">
                      {formatPrice(getTotalPrice())}
                    </span>

                    {/* Original price - strikethrough */}
                    <span className="text-lg text-gray-500 line-through mr-3">
                      {formatPrice(product.originalPrice * quantity)}
                    </span>

                    {/* Savings amount */}
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                      Save {formatPrice((product.originalPrice - product.price) * quantity)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900 mr-2">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                )}
              </div>

              {/* Discount Timer */}
              {product.discountEndDate && new Date(product.discountEndDate) > new Date() && (
                <div className="mb-6 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <h5 className="font-medium text-orange-800 mb-1">Limited Time Offer:</h5>
                  <DiscountTimer endDate={product.discountEndDate} />
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-2">Color:</h5>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color
                          ? 'border-purple-500 scale-110 shadow-md'
                          : 'border-gray-300'
                          }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {selectedColor === color && (
                          <svg className="w-6 h-6 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-2">Size:</h5>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`h-10 min-w-[40px] px-3 rounded-md border transition-all ${selectedSize === size
                            ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                            : 'border-gray-300 bg-white text-gray-700'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* User Rating Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-3">Your Rating</h5>
                <RatingStars
                  initialRating={userRating}
                  size="large"
                  onRatingChange={handleRatingChange}
                  labelText="Rate this product:"
                />
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-2">Quantity:</h5>
                <div className="flex items-center">
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 h-10 w-10 rounded-l-lg flex items-center justify-center transition duration-200"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                    </svg>
                  </button>
                  <input
                    type="number"
                    className="h-10 w-16 border-gray-200 text-center focus:ring-purple-500 focus:border-purple-500"
                    value={quantity}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                  />
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 h-10 w-10 rounded-r-lg flex items-center justify-center transition duration-200"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Selected Options Summary */}
              {(selectedColor || selectedSize) && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Selected Options:</h5>
                  <div className="flex flex-wrap gap-4">
                    {selectedColor && (
                      <div className="flex items-center">
                        <span className="text-gray-700 mr-2">Color:</span>
                        <div className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: selectedColor }}></div>
                        <span className="ml-2 text-gray-900">{selectedColor}</span>
                      </div>
                    )}
                    {selectedSize && (
                      <div className="flex items-center">
                        <span className="text-gray-700 mr-2">Size:</span>
                        <span className="text-gray-900 font-medium">{selectedSize}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-3 px-4 rounded-lg font-medium ${product.soldOut
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                      } transition duration-200`}
                    onClick={handleAddToCart}
                    disabled={product.soldOut}
                  >
                    {product.soldOut ? 'Sold Out' : 'Add to Cart'}
                  </button>

                  <button
                    className={`p-3 rounded-lg ${isInWishlist(product._id)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      } transition duration-200`}
                    onClick={handleWishlistToggle}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                </div>

                {/* Buy on WhatsApp button */}
                <button
                  className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition duration-200"
                  onClick={handleWhatsAppClick}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Buy on WhatsApp
                </button>
              </div>

              {/* Stock Status */}
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.soldOut
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
                  }`}>
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${product.soldOut ? 'bg-red-500' : 'bg-green-500'
                    }`}></span>
                  {product.soldOut ? 'Out of Stock' : 'In Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Centered Product Description */}
        <div className="mt-10 text-center mx-auto max-w-4xl">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-purple-600 mb-6">Product Description</h2>
            <div className="prose prose-lg mx-auto text-gray-700">
              <p
                className={`whitespace-pre-line ${containsArabic(product.description) ? 'text-right' : ''}`}
                dir={containsArabic(product.description) ? "rtl" : "ltr"}
                style={containsArabic(product.description) ? {
                  fontFamily: "'Tajawal', 'Noto Sans Arabic', sans-serif",
                  lineHeight: 1.8
                } : {}}
              >
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Similar Products - Now using ProductList for horizontal scrolling */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <ProductList
              title="You Might Also Like"
              products={similarProducts}
              loading={loadingSimilar}
              error={null}
              scrollable={true}
              viewAllUrl={getViewAllUrl()}
              viewAllText="View All Similar Products"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;