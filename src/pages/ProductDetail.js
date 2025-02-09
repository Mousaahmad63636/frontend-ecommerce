import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';
import api from '../api/api';

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: #fff;
`;

const BackButton = styled.button`
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
`;

const Gallery = styled.div`
  position: relative;
  width: 100%;
  height: 100vw; // Square aspect ratio on mobile
  background: #f8f9fa;

  @media (min-width: 768px) {
    height: 50vh;
    min-height: 400px;
  }
`;

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const ImageNav = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
`;

const ThumbButton = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? '#000' : 'rgba(0,0,0,0.2)'};
  padding: 0;
`;

const ProductInfo = styled.div`
  padding: 20px;
  position: relative;
  background: white;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  z-index: 2;
`;

const PriceTag = styled.div`
  position: absolute;
  top: -50px;
  right: 20px;
  background: white;
  padding: 10px 20px;
  border-radius: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ActionButtons = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  z-index: 100;
`;

const Button = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &.primary {
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
`;

function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        setProduct(data);
      } catch (err) {
        showNotification('Failed to load product details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading || !product) {
    return <div>Loading...</div>;
  }

  const hasDiscount = product.discountPercentage > 0;

  return (
    <PageContainer>
      <Helmet>
        <title>{product.name}</title>
      </Helmet>

      <BackButton onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left"></i>
      </BackButton>

      <Gallery>
        <MainImage 
          src={getImageUrl(product.images[currentImageIndex])}
          alt={product.name}
          onError={(e) => {
            e.target.src = 'https://placehold.co/500@3x.png';
          }}
        />
        {product.images.length > 1 && (
          <ImageNav>
            {product.images.map((_, index) => (
              <ThumbButton
                key={index}
                active={currentImageIndex === index}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </ImageNav>
        )}
      </Gallery>

      <ProductInfo>
        <PriceTag>
          <span className="fw-bold fs-4">${product.price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-decoration-line-through text-muted small">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </PriceTag>

        <h1 className="h4 mb-3">{product.name}</h1>

        {product.soldOut && (
          <div className="badge bg-danger mb-3">Sold Out</div>
        )}

        <p className="text-muted mb-4">{product.description}</p>

        {hasDiscount && (
          <div className="alert alert-success">
            Save ${(product.originalPrice - product.price).toFixed(2)} with this offer!
          </div>
        )}
      </ProductInfo>

      <div style={{ height: '100px' }}></div>

      <ActionButtons>
        <Button
          className="primary"
          onClick={() => addToCart(product)}
          disabled={product.soldOut}
        >
          <i className="fas fa-shopping-cart"></i>
          {product.soldOut ? 'Sold Out' : 'Add to Cart'}
        </Button>

        <Button
          className="whatsapp"
          onClick={() => {
            const message = encodeURIComponent(
              `Hi! I'm interested in buying ${product.name}\n\nProduct Link: ${window.location.href}`
            );
            window.open(
              `https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER}?text=${message}`,
              '_blank'
            );
          }}
          disabled={product.soldOut}
        >
          <i className="fab fa-whatsapp"></i>
          {!product.soldOut && 'Order on WhatsApp'}
        </Button>
      </ActionButtons>
    </PageContainer>
  );
}

export default ProductDetail;