import styled from 'styled-components';

export const HomeWrapper = styled.div`
  width: 100%;
`;

export const HeroSection = styled.section`
  position: relative;
  width: 100%;
  height: 400px;
`;

export const HeroMedia = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
`;

export const HeroContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 1;
`;