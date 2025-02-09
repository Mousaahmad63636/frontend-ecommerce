// src/components/ProductList.js
import React from 'react';
import styled from 'styled-components';
import ProductItem from './ProductItem';

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 0 16px;
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 0 4px; // Minimal padding to maximize card width
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;
  background: #fbfbfd; // Apple-style background
  border-radius: 12px;
  max-width: 600px;
  margin: 40px auto;

  h3 {
    color: #1d1d1f; // Apple's typical text color
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
    letter-spacing: -0.003em;
  }

  p {
    color: #86868b; // Apple's secondary text color
    font-size: 17px;
    line-height: 1.47059;
    letter-spacing: -0.022em;
    margin: 0 auto;
    max-width: 400px;
  }

  @media (max-width: 640px) {
    padding: 40px 16px;
    margin: 20px auto;

    h3 {
      font-size: 20px;
    }

    p {
      font-size: 15px;
    }
  }
`;

const ProductListWrapper = styled.div`
  background-color: #fff;
  min-height: 200px;
  width: 100%;
  
  // Add subtle gradient background for empty space
  background: linear-gradient(
    180deg, 
    rgba(251,251,253,0) 0%,
    rgba(251,251,253,0.5) 100%
  );
`;

const ProductListContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 0;

  @media (max-width: 640px) {
    padding: 12px 0;
  }
`;

function ProductList({ products }) {
  if (!products || products.length === 0) {
    return (
      <EmptyState>
        <h3>No Products Found</h3>
        <p>We couldn't find any products matching your criteria. Please try adjusting your search.</p>
      </EmptyState>
    );
  }

  return (
    <ProductListWrapper>
      <ProductListContainer>
        <ProductGrid>
          {products.map(product => (
            <ProductItem key={product._id} product={product} />
          ))}
        </ProductGrid>
      </ProductListContainer>
    </ProductListWrapper>
  );
}

export default ProductList;