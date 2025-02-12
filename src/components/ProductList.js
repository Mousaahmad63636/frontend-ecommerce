import React from 'react';
import ProductItem from './ProductItem'; // Make sure the path is correct
import { ProductListContainer, ProductGrid, NoProductsMessage } from '../styles/ProductListStyles';

function ProductList({ products }) {
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
        {products.map(product => (
          <ProductItem key={product._id} product={product} />
        ))}
      </ProductGrid>
    </ProductListContainer>
  );
}

export default ProductList;