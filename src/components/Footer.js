// src/components/Footer.js
import React, { useState, useEffect } from 'react';

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
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Follow Us</h5>
            <div className="social-links">
              <a href="https://instagram.com" className="text-white me-3" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram fa-lg"></i>
              </a>
              <a href="https://facebook.com" className="text-white me-3" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook fa-lg"></i>
              </a>
              <a href="https://tiktok.com" className="text-white" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-tiktok fa-lg"></i>
              </a>
            </div>
          </div>
          <div className="col-md-6">
            <h5>Contact Us</h5>
            <p className="mb-0">Email: support@example.com</p>
            <p>Phone: +1 234 567 890</p>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center">
          <p className="mb-0">&copy; 2024 Your E-commerce Store. All rights reserved.</p>
        </div>
      </div>
      {showScroll && (
        <div 
          className="scroll-to-top"
          onClick={scrollTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            zIndex: 1000
          }}
        >
          <i className="fas fa-arrow-up text-white"></i>
        </div>
      )}
    </footer>
  );
}

export default Footer;