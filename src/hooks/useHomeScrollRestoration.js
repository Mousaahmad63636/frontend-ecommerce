// src/hooks/useHomeScrollRestoration.js
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const useHomeScrollRestoration = (loading = false) => {
  const location = useLocation();
  const scrollKey = 'scroll-home';
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const pendingScrollRef = useRef(null);

  // Save scroll position continuously
  const saveScrollPosition = useCallback(() => {
    if (!isRestoringRef.current && location.pathname === '/') {
      const scrollY = window.scrollY;
      sessionStorage.setItem(scrollKey, scrollY.toString());
      console.log(`💾 Saved home scroll position: ${scrollY}px`);
    }
  }, [location.pathname]);

  // Restore scroll position
  const restoreScrollPosition = useCallback(() => {
    if (hasRestoredRef.current || location.pathname !== '/') return false;

    const savedPosition = sessionStorage.getItem(scrollKey);
    if (!savedPosition) return false;

    const scrollY = parseInt(savedPosition, 10);
    if (scrollY <= 0) return false;

    // Check if page is tall enough to scroll to target position
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const windowHeight = window.innerHeight;
    const maxScrollY = documentHeight - windowHeight;

    if (maxScrollY < scrollY) {
      console.log(`⚠️ Page not tall enough yet. Need ${scrollY}px, max is ${maxScrollY}px`);
      return false;
    }

    // Restore scroll position
    isRestoringRef.current = true;
    hasRestoredRef.current = true;
    
    window.scrollTo(0, scrollY);
    console.log(`✅ Restored home scroll position to: ${scrollY}px`);
    
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 500);

    return true;
  }, [location.pathname]);

  // Set up scroll saving
  useEffect(() => {
    if (location.pathname !== '/') return;

    let saveTimer;
    const handleScroll = () => {
      if (!isRestoringRef.current) {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveScrollPosition, 150);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(saveTimer);
      // Save final position when leaving
      saveScrollPosition();
    };
  }, [location.pathname, saveScrollPosition]);

  // Try to restore on mount
  useEffect(() => {
    if (location.pathname !== '/' || hasRestoredRef.current) return;

    const savedPosition = sessionStorage.getItem(scrollKey);
    if (savedPosition) {
      const scrollY = parseInt(savedPosition, 10);
      pendingScrollRef.current = scrollY;
      console.log(`🔄 Pending scroll restoration to: ${scrollY}px`);
    }

    // Try immediate restoration
    setTimeout(() => {
      if (restoreScrollPosition()) {
        pendingScrollRef.current = null;
      }
    }, 100);
  }, [location.pathname, restoreScrollPosition]);

  // Try to restore after loading completes
  useEffect(() => {
    if (loading || !pendingScrollRef.current || hasRestoredRef.current) return;

    console.log(`🚀 Content loaded, attempting scroll restoration...`);
    
    // Wait a bit for DOM to settle
    const attemptRestore = () => {
      if (restoreScrollPosition()) {
        pendingScrollRef.current = null;
      } else {
        // Try again after a longer delay
        setTimeout(() => {
          if (pendingScrollRef.current && restoreScrollPosition()) {
            pendingScrollRef.current = null;
          }
        }, 500);
      }
    };

    setTimeout(attemptRestore, 200);
  }, [loading, restoreScrollPosition]);

  // Fallback: keep trying until successful or timeout
  useEffect(() => {
    if (!pendingScrollRef.current || hasRestoredRef.current) return;

    const scrollY = pendingScrollRef.current;
    let attempts = 0;
    const maxAttempts = 30; // Try for 3 seconds

    const keepTrying = () => {
      attempts++;
      console.log(`🔄 Scroll restoration attempt ${attempts}/${maxAttempts} for ${scrollY}px`);

      if (restoreScrollPosition()) {
        pendingScrollRef.current = null;
        console.log(`✅ Successfully restored after ${attempts} attempts`);
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(keepTrying, 100);
      } else {
        console.log(`❌ Failed to restore scroll position after ${attempts} attempts`);
        pendingScrollRef.current = null;
        hasRestoredRef.current = false; // Allow future attempts
      }
    };

    const timer = setTimeout(keepTrying, 300);
    return () => clearTimeout(timer);
  }, [restoreScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    hasPendingRestore: !!pendingScrollRef.current
  };
};
