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
import RatingStars from '../components/RatingStars';
import WhatsAppMetaTags from '../components/WhatsAppMetaTags';

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
  const [userRating, setUserRating] = useState(0);

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
  // In handleWhatsAppClick function
  const handleWhatsAppClick = () => {
    if (!product) return;

    const phoneNumber = '96178934833';
    const productUrl = window.location.href;
    // Add preview parameter to help WhatsApp recognize this is a product page
    const messageWithPreview = encodeURIComponent(
      `Hi! I'm interested in buying ${product.name}\n\nProduct Link: ${productUrl}?preview=true`
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
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200">
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
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex flex-wrap text-sm text-gray-600">
            <li className="flex items-center">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
            </li>
            <li className="flex items-center">
              <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-600">
                {product.category}
              </Link>
              <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
            </li>
            <li className="text-gray-800 font-medium">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 p-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                {hasDiscount && (
                  <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {getDiscountPercentage()}% OFF
                  </div>
                )}

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
                        ? 'border-blue-500'
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
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full transition duration-200"
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

              {/* Price */}
              <div className="mb-6">
                {hasDiscount ? (
                  <div className="flex items-baseline flex-wrap">
                    <span className="text-3xl font-bold text-red-600 mr-2">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-lg text-gray-500 line-through mr-2">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                      Save {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Discount Timer */}
              {product.discountEndDate && new Date(product.discountEndDate) > new Date() && (
                <div className="mb-6 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <h5 className="font-medium text-orange-800 mb-1">Limited Time Offer:</h5>
                  <DiscountTimer endDate={product.discountEndDate} />
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                <p className="text-gray-600">{product.description}</p>
              </div>

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
                    className="h-10 w-16 border-gray-200 text-center focus:ring-blue-500 focus:border-blue-500"
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

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-3 px-4 rounded-lg font-medium ${product.soldOut
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
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

              {/* Shipping Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                    </svg>
                    <span className="text-sm">Fast delivery available</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <span className="text-sm">Cash on delivery</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path>
                    </svg>
                    <span className="text-sm">Easy returns within 7 days</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span className="text-sm">Secure payment</span>
                  </div>
                </div>
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

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">You Might Also Like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarProducts.map(similarProduct => (
                <div key={similarProduct._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow transition duration-200">
                  <Link to={`/product/${similarProduct._id}`} className="block relative aspect-square">
                    <img
                      src={similarProduct.images && similarProduct.images.length > 0
                        ? getImageUrl(similarProduct.images[0])
                        : '/placeholder.jpg'}
                      alt={similarProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${similarProduct._id}`} className="block">
                      <h5 className="text-gray-900 font-medium text-sm mb-1 line-clamp-2">{similarProduct.name}</h5>
                    </Link>
                    <p className="text-gray-900 font-bold mb-2">
                      {formatPrice(similarProduct.price)}
                    </p>
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition duration-200"
                      onClick={() => {
                        addToCart(similarProduct);
                      }}
                    >
                      Add to Cart
                    </button>
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