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
    if (!wasPopRef.current) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;