// src/hooks/useScrollRestoration.js
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollRestoration = (key = 'main') => {
  const location = useLocation();
  const scrollKey = `scroll-${key}`;
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);

  // Save scroll position when scrolling
  useEffect(() => {
    let saveTimer;
    
    const saveScrollPosition = () => {
      if (!isRestoringRef.current) {
        const scrollY = window.scrollY;
        sessionStorage.setItem(scrollKey, scrollY.toString());
        console.log(`Saved scroll position: ${scrollY}px`);
      }
    };

    const handleScroll = () => {
      if (!isRestoringRef.current) {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveScrollPosition, 150);
      }
    };

    // Save immediately on mount if we're scrolled
    if (window.scrollY > 0 && !hasRestoredRef.current) {
      saveScrollPosition();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(saveTimer);
      // Save final position
      saveScrollPosition();
    };
  }, [scrollKey]);

  // Restore scroll position on mount
  useEffect(() => {
    if (hasRestoredRef.current) return;

    const savedPosition = sessionStorage.getItem(scrollKey);
    if (savedPosition && location.pathname === '/') {
      const scrollY = parseInt(savedPosition, 10);
      if (scrollY > 0) {
        console.log(`Attempting to restore scroll position: ${scrollY}px`);
        
        isRestoringRef.current = true;
        hasRestoredRef.current = true;
        
        // Wait a bit for content to render
        const restoreScroll = () => {
          window.scrollTo(0, scrollY);
          console.log(`Restored scroll position to: ${scrollY}px`);
          
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 200);
        };

        // Try multiple times to ensure it works
        setTimeout(restoreScroll, 100);
        setTimeout(restoreScroll, 300);
        setTimeout(restoreScroll, 500);
      }
    }
  }, [scrollKey, location.pathname]);

  return null;
};
