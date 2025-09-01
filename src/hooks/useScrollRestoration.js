// src/hooks/useScrollRestoration.js
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollRestoration = (key = 'main') => {
  const location = useLocation();
  const scrollKey = `scroll-${key}-${location.pathname}`;
  const isRestoringRef = useRef(false);

  // Save scroll position when leaving the page
  useEffect(() => {
    const saveScrollPosition = () => {
      if (!isRestoringRef.current) {
        sessionStorage.setItem(scrollKey, window.scrollY.toString());
      }
    };

    // Save on page unload
    window.addEventListener('beforeunload', saveScrollPosition);
    
    // Save periodically while scrolling (throttled)
    let saveTimer;
    const handleScroll = () => {
      if (!isRestoringRef.current) {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveScrollPosition, 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(saveTimer);
      // Final save on cleanup
      saveScrollPosition();
    };
  }, [scrollKey]);

  // Restore scroll position when component mounts
  useEffect(() => {
    // Only restore on back navigation or page refresh
    const navigation = performance.getEntriesByType('navigation')[0];
    const isBackNavigation = navigation && navigation.type === 'back_forward';
    const isPageRefresh = navigation && navigation.type === 'reload';
    
    if (isBackNavigation || isPageRefresh) {
      const savedPosition = sessionStorage.getItem(scrollKey);
      if (savedPosition) {
        const scrollY = parseInt(savedPosition, 10);
        if (scrollY > 0) {
          isRestoringRef.current = true;
          
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            window.scrollTo(0, scrollY);
            
            // Reset flag after restoration
            setTimeout(() => {
              isRestoringRef.current = false;
            }, 100);
          });
        }
      }
    }
  }, [scrollKey]);

  return null;
};
