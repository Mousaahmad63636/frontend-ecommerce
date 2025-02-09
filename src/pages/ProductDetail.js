// src/pages/ProductDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSwipeable } from 'react-swipeable';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';
import api from '../api/api';
import ProductItem from '../components/ProductItem';
import * as S from '../styles/ProductDetailStyles';

function ProductDetail() {
  const [state, setState] = useState({
    product: null,
    loading: true,
    error: null,
    currentImageIndex: 0,
    quantity: 1
  });

  const touchStartX = useRef(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProductById(id);
        setState(prev => ({
          ...prev,
          product: data,
          loading: false
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: 'Failed to load product details',
          loading: false
        }));
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!state.product) return;

      try {
        const products = await api.getProducts();
        const filtered = products.filter(p => 
          p.category === state.product.category && 
          p._id !== state.product._id
        ).slice(0, 4);
        setRelatedProducts(filtered);
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    fetchRelatedProducts();
  }, [state.product]);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleImageNavigation('next'),
    onSwipedRight: () => handleImageNavigation('prev'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handleImageNavigation = (direction) => {
    if (!state.product?.images) return;

    setState(prev => ({
      ...prev,
      currentImageIndex: direction === 'next'
        ? (prev.currentImageIndex + 1) % prev.product.images.length
        : prev.currentImageIndex === 0
          ? prev.product.images.length - 1
          : prev.currentImageIndex - 1
    }));
  };

  const handleQuantityChange = (change) => {
    setState(prev => ({
      ...prev,
      quantity: Math.max(1, Math.min(10, prev.quantity + change))
    }));
  };

  const handleAddToCart = () => {
    if (state.product.soldOut) {
      showNotification('This product is sold out', 'error');
      return;
    }

    addToCart({
      ...state.product,
      quantity: state.quantity
    });
    showNotification('Added to cart successfully', 'success');
  };

  const handleWishlistToggle = async () => {
    try {
      const isProductInWishlist = isInWishlist(state.product._id);
      if (isProductInWishlist) {
        await removeFromWishlist(state.product._id);
        showNotification('Removed from wishlist', 'success');
      } else {
        await addToWishlist(state.product);
        showNotification('Added to wishlist', 'success');
      }
    } catch (error) {
      showNotification('Failed to update wishlist', 'error');
    }
  };

  const handleWhatsAppOrder = () => {
    if (state.product.soldOut) return;

    const message = encodeURIComponent(
      `Hi! I'm interested in buying ${state.product.name} (${state.quantity} items)\n\n` +
      `Product Link: ${window.location.href}\n` +
      `Price: $${(state.product.price * state.quantity).toFixed(2)}`
    );
    
    window.open(
      `https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${message}`,
      '_blank'
    );
  };

  if (state.loading) {
    return (
      <S.LoadingContainer>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </S.LoadingContainer>
    );
  }

  if (state.error || !state.product) {
    return (
      <S.ErrorContainer>
        <div className="alert alert-danger">
          {state.error || 'Product not found'}
        </div>
      </S.ErrorContainer>
    );
  }

  const { product, currentImageIndex, quantity } = state;
  const hasDiscount = product.discountPercentage > 0;
  const isWishlisted = isInWishlist(product._id);

  return (
    <S.PageContainer>
      <Helmet>
        <title>{product.name} - Your Store</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <S.BackButton onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left"></i>
      </S.BackButton>

      <S.DesktopContainer>
        <div>
          <S.Gallery {...handlers}>
            <S.ImageSwiper currentIndex={currentImageIndex}>
              {product.images.map((image, index) => (
                <S.ImageContainer key={index}>
                  <S.MainImage
                    src={getImageUrl(image)}
                    alt={`${product.name} - Image ${index + 1}`}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/500@3x.png';
                    }}
                  />
                </S.ImageContainer>
              ))}
            </S.ImageSwiper>

            <S.ImageNav>
              {product.images.map((_, index) => (
                <S.NavDot
                  key={index}
                  active={currentImageIndex === index}
                  onClick={() => setState(prev => ({ ...prev, currentImageIndex: index }))}
                />
              ))}
            </S.ImageNav>
          </S.Gallery>

          <S.ThumbnailsContainer>
            {product.images.map((image, index) => (
              <S.Thumbnail
                key={index}
                active={currentImageIndex === index}
                onClick={() => setState(prev => ({ ...prev, currentImageIndex: index }))}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`Thumbnail ${index + 1}`}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/80@3x.png';
                  }}
                />
              </S.Thumbnail>
            ))}
          </S.ThumbnailsContainer>
        </div>

        <S.ProductInfo>
          <S.PriceTag>
            <S.CurrentPrice hasDiscount={hasDiscount}>
              ${(product.price * quantity).toFixed(2)}
            </S.CurrentPrice>
            {hasDiscount && (
              <S.OriginalPrice>
                ${(product.originalPrice * quantity).toFixed(2)}
              </S.OriginalPrice>
            )}
          </S.PriceTag>

          <S.ProductTitle>{product.name}</S.ProductTitle>

          {product.soldOut && (
            <S.SoldOutBadge>Sold Out</S.SoldOutBadge>
          )}

          <S.Description>{product.description}</S.Description>

          <S.QuantitySelector>
            <S.QuantityLabel>Quantity:</S.QuantityLabel>
            <S.QuantityControls>
              <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                <i className="fas fa-minus"></i>
              </button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)} disabled={quantity >= 10}>
                <i className="fas fa-plus"></i>
              </button>
            </S.QuantityControls>
          </S.QuantitySelector>

          <S.ActionButtons>
            <S.WishlistButton
              onClick={handleWishlistToggle}
              active={isWishlisted}
            >
              <i className="fas fa-heart"></i>
            </S.WishlistButton>

            <S.AddToCartButton
              onClick={handleAddToCart}
              disabled={product.soldOut}
            >
              <i className="fas fa-shopping-cart"></i>
              {product.soldOut ? 'Sold Out' : 'Add to Cart'}
            </S.AddToCartButton>

            <S.WhatsAppButton
              onClick={handleWhatsAppOrder}
              disabled={product.soldOut}
            >
              <i className="fab fa-whatsapp"></i>
              {!product.soldOut && <span className="whatsapp-text">Order on WhatsApp</span>}
            </S.WhatsAppButton>
          </S.ActionButtons>
        </S.ProductInfo>
      </S.DesktopContainer>

      {relatedProducts.length > 0 && (
        <S.RelatedProductsSection>
          <S.RelatedProductsTitle>Related Products</S.RelatedProductsTitle>
          <S.RelatedProductsGrid>
            {relatedProducts.map(product => (
              <ProductItem 
                key={product._id} 
                product={product}
                onProductClick={() => {
                  window.scrollTo(0, 0);
                }}
              />
            ))}
          </S.RelatedProductsGrid>
        </S.RelatedProductsSection>
      )}
    </S.PageContainer>
  );
}

export default ProductDetail;