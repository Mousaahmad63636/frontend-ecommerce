// src/components/ScrollToTop.js
import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const wasPopRef = useRef(false);

  useEffect(() => {
    // Skip auto-scroll on POP (back/forward) navigations to preserve position
    wasPopRef.current = navType === 'POP';
  }, [navType]);

  useEffect(() => {
    // Don't scroll to top on back navigation or when going back to home
    if (!wasPopRef.current && pathname !== '/') {
      window.scrollTo(0, 0);
    }
    // Reset the flag after handling
    wasPopRef.current = false;
  }, [pathname]);

  return null;
}

export default ScrollToTop;