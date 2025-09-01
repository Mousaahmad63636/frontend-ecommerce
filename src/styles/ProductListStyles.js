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
export const HorizontalScrollSection = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  padding: 20px 0;

  &::-webkit-scrollbar {
    display: none; /* Chrome/Safari/Opera */
  }

  .product-card {
    display: inline-block;
    width: 280px;
    margin-right: 20px;
    white-space: normal;
    vertical-align: top;

    &:last-child {
      margin-right: 0;
    }
  }

  /* Add smooth scrolling behavior */
  scroll-behavior: smooth;
`;

export const ScrollControls = styled.div`
  position: relative;
  margin: 0 -15px;

  .scroll-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: white;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
    }

    &.prev {
      left: 15px;
    }

    &.next {
      right: 15px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;