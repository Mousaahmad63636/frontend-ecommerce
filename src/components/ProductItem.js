import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from './Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';

const ProductCard = styled(Link)`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  @media (max-width: 640px) {
    border-radius: 8px;
  }
`;
const PriceOverlay = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 640px) {
    padding: 6px 10px;
  }
`;
const ImageContainer = styled.div`
  position: relative;
  padding-top: 100%;
  background: #f8f9fa;
  overflow: hidden;
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
  transition: transform 0.3s ease;

  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  color: #2d3436;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;

  @media (max-width: 640px) {
    font-size: 0.9rem;
  }
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Price = styled.span`
  font-size: ${props => props.isDiscounted ? '1.1rem' : '1rem'};
  font-weight: ${props => props.isDiscounted ? '600' : '500'};
  color: ${props => props.isDiscounted ? '#e74c3c' : '#2d3436'};

  @media (max-width: 640px) {
    font-size: ${props => props.isDiscounted ? '1rem' : '0.9rem'};
  }
`;

const OriginalPrice = styled.span`
  font-size: 0.9rem;
  color: #95a5a6;
  text-decoration: line-through;

  @media (max-width: 640px) {
    font-size: 0.8rem;
  }
`;

const BadgesContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 2;
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background: ${props => props.type === 'discount' ? '#e74c3c' : '#2ecc71'};

  @media (max-width: 640px) {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: none;
  background: white;
  color: ${props => props.active ? '#e74c3c' : '#95a5a6'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 2;

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 640px) {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }
`;

const SoldOutOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
`;

const SoldOutBadge = styled.div`
  background: #e74c3c;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;

  @media (max-width: 640px) {
    font-size: 0.9rem;
    padding: 6px 12px;
  }
`;

const ActionButtonsContainer = styled.div`
  padding: 0 15px 15px;
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background: #007bff;
    color: white;

    &:hover {
      background: #0056b3;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  &.whatsapp {
    background: ${props => props.disabled ? '#ccc' : '#25D366'};
    color: white;

    &:hover:not(:disabled) {
      background: #128C7E;
    }

    .whatsapp-text {
      @media (max-width: 640px) {
        display: none;
      }
    }
  }

  @media (max-width: 640px) {
    padding: 8px;
  }
`;

function ProductItem({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification } = useNotification();
  const [isHovered, setIsHovered] = useState(false);

  const hasDiscount = product.discountPercentage > 0;
  const isWishlisted = isInWishlist(product._id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

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
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.soldOut) return;

    const productUrl = `${window.location.origin}/product/${product._id}`;
    const message = encodeURIComponent(
      `Hi! I'm interested in buying ${product.name}\n\nProduct Link: ${productUrl}\nPrice: $${product.price.toFixed(2)}`
    );
    
    window.open(
      `https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${message}`,
      '_blank'
    );
  };

  return (
    <ProductCard 
      to={`/product/${product._id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
<ImageContainer>
  {product.soldOut && (
    <SoldOutOverlay>
      <SoldOutBadge>Sold Out</SoldOutBadge>
    </SoldOutOverlay>
  )}

  <BadgesContainer>
    {hasDiscount && (
      <Badge type="discount">
        Save {product.discountPercentage}%
      </Badge>
    )}
    {product.isNew && (
      <Badge type="new">New</Badge>
    )}
  </BadgesContainer>

  <WishlistButton
    onClick={handleWishlistToggle}
    active={isWishlisted}
    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
  >
    <i className="fas fa-heart"></i>
  </WishlistButton>

  <PriceOverlay>
    <Price isDiscounted={hasDiscount}>
      ${product.price.toFixed(2)}
    </Price>
    {hasDiscount && (
      <OriginalPrice>
        ${product.originalPrice.toFixed(2)}
      </OriginalPrice>
    )}
  </PriceOverlay>

  <ProductImage
    src={getImageUrl(product.images[0])}
    alt={product.name}
    onError={(e) => {
      e.target.src = 'https://placehold.co/300@3x.png';
    }}
  />
</ImageContainer>

<ProductInfo>
  <ProductName>{product.name}</ProductName>
</ProductInfo>

<ActionButtonsContainer>
  <ActionButton 
    className="primary"
    onClick={handleAddToCart}
    disabled={product.soldOut}
  >
    <i className="fas fa-shopping-cart"></i>
    {product.soldOut ? 'Sold Out' : 'Add to Cart'}
  </ActionButton>
  
  <ActionButton 
    className="whatsapp"
    onClick={handleWhatsAppClick}
    disabled={product.soldOut}
  >
    <i className="fab fa-whatsapp"></i>
    <span className="whatsapp-text">
      {!product.soldOut && 'Order on WhatsApp'}
    </span>
  </ActionButton>
</ActionButtonsContainer>
    </ProductCard>
  );
}

export default ProductItem;