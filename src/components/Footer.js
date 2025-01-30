import React, { useState, useEffect } from 'react';
import {
  FooterWrapper,
  FooterContainer,
  FooterGrid,
  FooterSection,
  SocialLinks,
  ContactInfo,
  Divider,
  Copyright,
  ScrollToTop
} from '../styles/FooterStyles';

function Footer() {
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <FooterWrapper>
      <FooterContainer>
        <FooterGrid>
          <FooterSection>
            <h5>Follow Us</h5>
            <SocialLinks>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on TikTok"
              >
                <i className="fab fa-tiktok"></i>
              </a>
            </SocialLinks>
          </FooterSection>

          <FooterSection>
            <h5>Contact Us</h5>
            <ContactInfo>
              <p>Email: support@example.com</p>
              <p>Phone: +1 234 567 890</p>
              <p>Address: 123 Street Name, City, Country</p>
            </ContactInfo>
          </FooterSection>
        </FooterGrid>

        <Divider />

        <Copyright>
          <p>&copy; {new Date().getFullYear()} Your E-commerce Store. All rights reserved.</p>
        </Copyright>
      </FooterContainer>

      {showScroll && (
        <ScrollToTop 
          onClick={scrollTop}
          role="button"
          aria-label="Scroll to top"
        >
          <i className="fas fa-arrow-up"></i>
        </ScrollToTop>
      )}
    </FooterWrapper>
  );
}

export default Footer;