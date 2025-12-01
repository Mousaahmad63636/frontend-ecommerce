import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Header Styles
export const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 1000;
  padding: 10px 15px;
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
`;

export const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SearchForm = styled.form`
  flex: 1;
  max-width: 500px;
  margin: 0 15px;
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 8px 35px 8px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;

  &:focus {
    border-color: #007bff;
  }
`;

export const NavIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

// Home Styles
export const HomeContainer = styled.div`
  margin-top: 60px;
  padding: 15px;
`;

export const HeroSection = styled.section`
  position: relative;
  height: 50vh;
  min-height: 300px;
  background-size: cover;
  background-position: center;
  margin: -15px -15px 20px;
  
  @media (max-width: 768px) {
    height: 40vh;
  }
`;

export const HeroContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  width: 90%;
  max-width: 600px;
`;

export const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

// ProductList Styles
export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 15px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

export const ProductCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

export const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

export const ProductInfo = styled.div`
  padding: 15px;
`;

export const ProductTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 1rem;
`;

export const ProductPrice = styled.p`
  font-weight: bold;
  color: #007bff;
  margin: 0;
`;