import styled from 'styled-components';

export const FooterWrapper = styled.footer`
  background-color: #212529;
  color: white;
  padding: 2rem 1rem;
  margin-top: 3rem;
`;

export const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const FooterSection = styled.div`
  h5 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  a {
    color: white;
    font-size: 1.5rem;
    transition: color 0.3s ease;
    
    &:hover {
      color: #007bff;
    }
  }
`;

export const ContactInfo = styled.div`
  p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const Divider = styled.hr`
  border-color: rgba(255, 255, 255, 0.1);
  margin: 2rem 0;
`;

export const Copyright = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
`;

export const ScrollToTop = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #007bff;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #0056b3;
    transform: translateY(-3px);
  }

  i {
    font-size: 1.2rem;
  }
`;