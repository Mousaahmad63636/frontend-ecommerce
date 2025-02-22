// src/styles/HomeStyles.js
import styled from 'styled-components';

// Define our theme colors at the top for consistency
const theme = {
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  secondary: '#FDA4AF',
  background: '#F3E8FF',
  white: '#FFFFFF',
  textGray: '#6B7280',
  gradientPrimary: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  gradientSecondary: 'linear-gradient(135deg, #FDA4AF 0%, #F9A8D4 100%)'
};

export const HomeWrapper = styled.div`
  margin-top: 0; // Changed from 60px to 0
  background-color: ${theme.background};
  min-height: 100vh;
`;

export const HeroSection = styled.section`
  position: relative;
  width: 100%;
  height: 80vh; // Increased from 70vh for fuller screen coverage
  min-height: 600px;
  background-color: ${theme.white};
  margin-bottom: 40px;
  overflow: hidden;
  margin-top: -80px; // Added to compensate for header space
  padding-top: 80px; // Added to ensure content doesn't go under header
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: ${theme.background};
    clip-path: ellipse(50% 60% at 50% 100%);
  }
`;

export const HeroMedia = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(139, 92, 246, 0.2),
      rgba(139, 92, 246, 0.4)
    );
  }
`;

export const HeroContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: ${theme.white};
  z-index: 2;
  width: 90%;
  max-width: 800px;
  padding: 2rem;
  background: rgba(139, 92, 246, 0.1);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.2);
`;

export const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${theme.white};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-family: 'Playfair Display', serif;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: ${theme.white};
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  font-weight: 300;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

export const Section = styled.section`
  padding: 4rem 0;
  background-color: ${props => props.background || theme.white};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -50px;
    left: 0;
    right: 0;
    height: 50px;
    background: inherit;
    clip-path: ellipse(50% 60% at 50% 100%);
    display: ${props => props.curved ? 'block' : 'none'};
  }
`;

export const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  color: ${theme.primary};
  font-family: 'Playfair Display', serif;

  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: ${theme.gradientPrimary};
    margin: 1rem auto;
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const CategorySelect = styled.select`
  width: 100%;
  max-width: 300px;
  margin: 0 auto 2rem;
  padding: 1rem 1.5rem;
  border: 2px solid ${theme.primaryLight};
  border-radius: 50px;
  background-color: ${theme.white};
  font-size: 1rem;
  color: ${theme.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${theme.primary}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
  }

  &:hover {
    border-color: ${theme.primary};
    transform: translateY(-2px);
  }
`;

export const NoResults = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: ${theme.white};
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
  margin: 2rem 0;

  h3 {
    font-size: 1.5rem;
    color: ${theme.primary};
    margin-bottom: 1rem;
    font-weight: 600;
  }

  p {
    color: ${theme.textGray};
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
  }
`;

export const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: ${theme.white};
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
`;

export const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;

  .timer-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 2rem;
    background: ${theme.white};
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
    
    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
      gap: 1.5rem;
    }
  }
`;

// Add a floating button for special offers
export const FloatingOfferButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  background: ${theme.gradientPrimary};
  color: ${theme.white};
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(139, 92, 246, 0.4);
  }

  @media (max-width: 768px) {
    bottom: 1rem;
    right: 1rem;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
`;