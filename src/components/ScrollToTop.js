// src/components/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Completely disable ScrollToTop for home page
    if (pathname === '/') {
      console.log('🏠 Home page detected - ScrollToTop disabled');
      return;
    }
    
    // For all other pages, scroll to top after a small delay
    setTimeout(() => {
      window.scrollTo(0, 0);
      console.log(`📄 Scrolled to top for: ${pathname}`);
    }, 10);
  }, [pathname]);

  return null;
}

export default ScrollToTop;