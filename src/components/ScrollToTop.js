// src/components/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Never scroll to top for home page - let it handle its own scroll restoration
    if (pathname === '/') {
      return;
    }
    
    // For all other pages, scroll to top
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;