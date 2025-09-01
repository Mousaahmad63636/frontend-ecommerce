// src/hooks/usePageVisibility.js
import { useEffect } from 'react';
import { useScrollPosition } from '../contexts/ScrollPositionContext';

export function usePageVisibility() {
  const { saveScrollPosition } = useScrollPosition();
  
  useEffect(() => {
    // Save scroll position when page is hidden (tab switch, navigation, etc.)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && window.location.pathname === '/') {
        saveScrollPosition('homePage', window.scrollY);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // For mobile browsers that don't reliably fire visibilitychange
    window.addEventListener('pagehide', () => {
      if (window.location.pathname === '/') {
        saveScrollPosition('homePage', window.scrollY);
      }
    });
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleVisibilityChange);
    };
  }, [saveScrollPosition]);
  
  return null;
}