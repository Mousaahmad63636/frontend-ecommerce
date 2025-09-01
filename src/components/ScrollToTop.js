// src/components/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Get navigation type to determine if this is a back navigation
    const navigation = performance.getEntriesByType('navigation')[0];
    const isBackNavigation = navigation && navigation.type === 'back_forward';
    
    // Only scroll to top on new navigation (not back navigation)
    // And not for the home page (let it handle its own scroll restoration)
    if (!isBackNavigation && pathname !== '/') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;