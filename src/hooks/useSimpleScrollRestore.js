// src/hooks/useSimpleScrollRestore.js
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useSimpleScrollRestore = () => {
  const location = useLocation();
  const hasRestoredRef = useRef(false);
  const scrollKey = 'home-scroll-position';

  useEffect(() => {
    // Only work on home page
    if (location.pathname !== '/') return;

    let scrollTimer;

    // Save scroll position while scrolling
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const scrollY = window.scrollY;
        if (scrollY > 0) {
          sessionStorage.setItem(scrollKey, scrollY.toString());
          console.log(`💾 Saved: ${scrollY}px`);
        }
      }, 100);
    };

    // Restore scroll position on mount (only once)
    if (!hasRestoredRef.current) {
      const savedScroll = sessionStorage.getItem(scrollKey);
      if (savedScroll) {
        const targetScroll = parseInt(savedScroll, 10);
        
        // Prevent any other scroll events during restoration
        const originalScrollTo = window.scrollTo;
        let isRestoring = true;
        
        // Override scrollTo temporarily
        window.scrollTo = (...args) => {
          if (!isRestoring) {
            originalScrollTo.apply(window, args);
          } else {
            console.log('🚫 Blocked scroll during restoration');
          }
        };

        console.log(`🔄 Restoring to: ${targetScroll}px`);
        
        const attemptRestore = () => {
          const maxHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
          ) - window.innerHeight;

          if (maxHeight >= targetScroll) {
            originalScrollTo.call(window, 0, targetScroll);
            console.log(`✅ Restored to: ${targetScroll}px`);
            
            // Re-enable normal scrollTo after restoration
            setTimeout(() => {
              isRestoring = false;
              window.scrollTo = originalScrollTo;
            }, 1000);
            
            hasRestoredRef.current = true;
            return true;
          }
          return false;
        };

        // Try multiple times until successful
        let attempts = 0;
        const maxAttempts = 20;
        
        const tryRestore = () => {
          attempts++;
          if (attemptRestore() || attempts >= maxAttempts) {
            if (attempts >= maxAttempts) {
              console.log(`❌ Failed after ${attempts} attempts`);
              isRestoring = false;
              window.scrollTo = originalScrollTo;
            }
            return;
          }
          setTimeout(tryRestore, 100);
        };

        // Start restoration attempts
        setTimeout(tryRestore, 50);
      } else {
        hasRestoredRef.current = true;
      }
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [location.pathname]);

  return null;
};
