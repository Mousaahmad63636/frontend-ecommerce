// src/styles/ProductDetailStyles.js
import styled from 'styled-components';

export const PageContainer = styled.div`
  min-height: 100vh;
  background: #fff;
  padding-bottom: 80px; // Space for fixed buttons

  @media (min-width: 1024px) {
    padding: 40px 0;
  }
`;

export const DesktopContainer = styled.div`
  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    padding: 0 20px;
  }
`;

export const BackButton = styled.button`
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    background: white;
  }

  @media (min-width: 1024px) {
    position: absolute;
    top: 20px;
    left: 20px;
  }
`;

export const Gallery = styled.div`
  position: relative;
  width: 100%;
  height: 100vw;
  background: #f8f9fa;
  overflow: hidden;

  @media (min-width: 1024px) {
    height: 600px;
    border-radius: 20px;
  }
`;

export const ImageSwiper = styled.div`
  display: flex;
  transition: transform 0.3s ease;
  height: 100%;
  transform: translateX(-${props => props.currentIndex * 100}%);
`;

export const ImageContainer = styled.div`
  flex: 0 0 100%;
  height: 100%;
`;

export const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
`;

export const ThumbnailsContainer = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    padding: 0 10px;
  }
`;

export const Thumbnail = styled.button`
  width: 80px;
  height: 80px;
  border: 2px solid ${props => props.active ? '#007bff' : 'transparent'};
  border-radius: 8px;
  padding: 2px;
  cursor: pointer;
  transition: all 0.2s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }

  &:hover {
    border-color: #007bff;
  }
`;

export const ImageNav = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const NavDot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? '#000' : 'rgba(0,0,0,0.2)'};
  padding: 0;
  transition: all 0.2s ease;
`;

export const ProductInfo = styled.div`
  padding: 20px;
  position: relative;
  background: white;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  z-index: 2;

  @media (min-width: 1024px) {
    margin-top: 0;
    padding: 0;
  }
`;

export const PriceTag = styled.div`
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;

  @media (min-width: 1024px) {
    display: inline-flex;
    margin-bottom: 30px;
  }
`;

export const CurrentPrice = styled.span`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.hasDiscount ? '#e74c3c' : '#2d3436'};

  @media (min-width: 1024px) {
    font-size: 28px;
  }
`;

export const OriginalPrice = styled.span`
  font-size: 16px;
  color: #95a5a6;
  text-decoration: line-through;
`;

export const ProductTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2d3436;
  line-height: 1.3;

  @media (min-width: 1024px) {
    font-size: 32px;
    margin-bottom: 20px;
  }
`;

export const SoldOutBadge = styled.div`
  display: inline-block;
  background: #e74c3c;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  margin-bottom: 20px;
`;

export const Description = styled.p`
  color: #636e72;
  line-height: 1.6;
  margin-bottom: 24px;
  font-size: 16px;

  @media (min-width: 1024px) {
    font-size: 17px;
  }
`;

export const QuantitySelector = styled.div`
  margin-bottom: 24px;
`;

export const QuantityLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2d3436;
`;

export const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 8px;
  width: fit-content;

  button {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: white;
    color: #2d3436;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);

    &:hover:not(:disabled) {
      background: #007bff;
      color: white;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  span {
    min-width: 40px;
    text-align: center;
    font-weight: 500;
  }
`;

export const ActionButtons = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: 10px;
  z-index: 100;

  @media (min-width: 1024px) {
    position: static;
    box-shadow: none;
    padding: 0;
    margin-top: 30px;
  }
`;

export const WishlistButton = styled.button`
  border: none;
  border-radius: 8px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.active ? '#e74c3c' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#636e72'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

export const AddToCartButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 0 20px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #007bff;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

export const WhatsAppButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 0 20px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #25D366;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #128C7E;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .whatsapp-text {
    @media (max-width: 374px) {
      display: none;
    }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

export const ErrorContainer = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: 40px auto;
`;