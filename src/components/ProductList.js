// src/components/ProductList.js
import React from 'react';
import styled from 'styled-components';
import ProductItem from './ProductItem';

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 10px;
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 5px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  h3 {
    color: #333;
    margin-bottom: 10px;
  }

  p {
    color: #666;
    max-width: 400px;
    margin: 0 auto;
  }
`;

function ProductList({ products }) {
  if (!products || products.length === 0) {
    return (
      <EmptyState>
        <h3>No Products Found</h3>
        <p>We couldn't find any products matching your criteria.</p>
      </EmptyState>
    );
  }

  return (
    <ProductGrid>
      {products.map(product => (
        <ProductItem key={product._id} product={product} />
      ))}
    </ProductGrid>
  );
}

export default ProductList;