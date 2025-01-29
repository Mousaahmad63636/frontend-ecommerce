import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ProductListContainer = styled.div`
  padding: 10px;
`;

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const ProductCard = styled(Link)`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
  text-decoration: none;
  color: inherit;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

export const ProductImageContainer = styled.div`
  position: relative;
  padding-top: 100%; // 1:1 Aspect ratio
  background: #f8f9fa;
  overflow: hidden;
`;

export const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
`;

export const SoldOutOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

export const SoldOutBadge = styled.div`
  background: #dc3545;
  color: white;
  padding: 5px 15px;
  border-radius: 4px;
  font-weight: bold;
`;

export const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  z-index: 1;
`;

export const WishlistButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  
  i {
    color: ${props => props.isWishlisted ? '#dc3545' : '#666'};
  }
`;

export const ProductInfo = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ProductName = styled.h3`
  margin: 0 0 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

export const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CurrentPrice = styled.span`
  font-weight: bold;
  color: ${props => props.hasDiscount ? '#dc3545' : '#333'};
`;

export const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: #999;
  font-size: 0.9rem;
`;

export const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  
  button {
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    
    &.add-to-cart {
      background: #007bff;
      color: white;
      
      &:disabled {
        background: #ccc;
      }
    }
    
    &.whatsapp {
      background: #25D366;
      color: white;
      
      &:disabled {
        background: #ccc;
      }
    }
  }
`;

export const NoProductsMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  
  p {
    color: #666;
    margin: 0;
  }
`;