import styled from 'styled-components';

export const HomeWrapper = styled.div`
  margin-top: 60px;
`;

export const HeroSection = styled.section`
  position: relative;
  width: 100%;
  height: 40vh;
  min-height: 300px;
  background-color: #f5f5f5;
  margin-bottom: 20px;
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
    background: rgba(0, 0, 0, 0.4);
  }
`;
export const HeroContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 1;
  width: 90%;
  padding: 0 15px;
`;

export const HeroTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 1rem;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);

  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`;

export const Section = styled.section`
  padding: 20px 15px;
  background-color: ${props => props.background || '#fff'};
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
  color: #333;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

export const CategorySelect = styled.select`
  width: 100%;
  max-width: 300px;
  margin: 0 auto 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  display: block;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const NoResults = styled.div`
  text-align: center;
  padding: 40px 20px;
  background-color: white;
  border-radius: 8px;
  margin: 20px 0;

  h3 {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 10px;
  }

  p {
    color: #666;
    font-size: 1rem;
  }
`;

export const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

export const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  width: 100%;

  .timer-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }
  }
`;