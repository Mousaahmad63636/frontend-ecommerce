import styled from 'styled-components';

export const ProductListContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`;

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

export const NoProductsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
`;