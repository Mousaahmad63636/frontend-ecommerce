import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';
import {
  ProductListContainer,
  ProductGrid,
  ProductCard,
  ProductImageContainer,
  ProductImage,
  SoldOutOverlay,
  SoldOutBadge,
  DiscountBadge,
  WishlistButton,
  ProductInfo,
  ProductName,
  PriceContainer,
  CurrentPrice,
  OriginalPrice,
  ActionButtons,
  NoProductsMessage
} from '../styles/ProductListStyles';

function ProductList({ products }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification } = useNotification();

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.soldOut) {
      showNotification('This product is sold out', 'error');
      return;
    }

    addToCart(product);

  };

  const handleWishlistToggle = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
    }
  };

  const handleWhatsAppClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const message = encodeURIComponent(`Hi! I'm interested in buying ${product.name}`);
    window.open(`https://wa.me/96178934833?text=${message}`, '_blank');
  };

  if (!products || products.length === 0) {
    return (
      <NoProductsMessage>
        <p>No products available.</p>
      </NoProductsMessage>
    );
  }

  return (
    <ProductListContainer>
      <ProductGrid>
        {products.map(product => {
          const hasDiscount = product.discountPercentage > 0;
          const originalPrice = hasDiscount ? product.originalPrice : product.price;
          const currentPrice = product.price;
          const isWishlisted = isInWishlist(product._id);

          return (
            <ProductCard key={product._id} to={`/product/${product._id}`}>
              <ProductImageContainer>
                {product.soldOut && (
                  <SoldOutOverlay>
                    <SoldOutBadge>Sold Out</SoldOutBadge>
                  </SoldOutOverlay>
                )}
                
                {hasDiscount && (
                  <DiscountBadge>
                    <i className="fas fa-tag"></i> Save ${(originalPrice - currentPrice).toFixed(2)}
                  </DiscountBadge>
                )}

                <WishlistButton
                  onClick={(e) => handleWishlistToggle(e, product)}
                  isWishlisted={isWishlisted}
                >
                  <i className="fas fa-heart"></i>
                </WishlistButton>

                <ProductImage
                  src={getImageUrl(product.images[0])}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/300@3x.png';
                  }}
                />
              </ProductImageContainer>

              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                
                <PriceContainer>
                  <CurrentPrice hasDiscount={hasDiscount}>
                    ${currentPrice.toFixed(2)}
                  </CurrentPrice>
                  {hasDiscount && (
                    <OriginalPrice>${originalPrice.toFixed(2)}</OriginalPrice>
                  )}
                </PriceContainer>

                <ActionButtons>
                  <button
                    className="add-to-cart"
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={product.soldOut}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    {product.soldOut ? 'Sold Out' : 'Add to Cart'}
                  </button>
                  
                  <button
                    className="whatsapp"
                    onClick={(e) => handleWhatsAppClick(e, product)}
                    disabled={product.soldOut}
                  >
                    <i className="fab fa-whatsapp"></i>
                    Buy on WhatsApp
                  </button>
                </ActionButtons>
              </ProductInfo>
            </ProductCard>
          );
        })}
      </ProductGrid>
    </ProductListContainer>
  );
}

export default ProductList;