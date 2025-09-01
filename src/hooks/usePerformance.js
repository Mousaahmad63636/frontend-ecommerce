// src/hooks/usePerformance.js
import { useEffect, useRef, useCallback } from 'react';
import cacheService from '../services/cacheService';
import imageCacheService from '../services/imageCacheService';

export const usePerformance = (componentName) => {
  const startTime = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    
    // Log component mount performance
    const mountTime = Date.now() - startTime.current;
    if (mountTime > 100) { // Only log slow mounts
      console.log(`[Performance] ${componentName} mounted in ${mountTime}ms`);
    }
  }, [componentName]);

  const measureApiCall = useCallback(async (apiName, apiCall) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      
      console.log(`[Performance] API ${apiName} took ${duration.toFixed(2)}ms`);
      
      // Log slow API calls
      if (duration > 1000) {
        console.warn(`[Performance] Slow API call: ${apiName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`[Performance] API ${apiName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      cache: cacheService.getStats(),
      images: imageCacheService.getCacheStats(),
      renderCount: renderCount.current
    };
  }, []);

  return {
    measureApiCall,
    getCacheStats,
    renderCount: renderCount.current
  };
};

// Performance monitoring utilities
export const measurePageLoad = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          const metrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
            firstByte: navigation.responseStart - navigation.fetchStart,
            domInteractive: navigation.domInteractive - navigation.fetchStart
          };
          
          console.log('[Performance] Page Load Metrics:', metrics);
          
          // Send to analytics if needed
          if (window.gtag) {
            window.gtag('event', 'page_load_performance', {
              custom_parameter: JSON.stringify(metrics)
            });
          }
        }
      }, 0);
    });
  }
};

// Measure Core Web Vitals
export const measureWebVitals = () => {
  if (typeof window !== 'undefined') {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('[Performance] LCP:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP measurement not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            console.log('[Performance] FID:', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID measurement not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          console.log('[Performance] CLS:', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS measurement not supported');
      }
    }
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
    const logMemory = () => {
      const memory = performance.memory;
      console.log('[Performance] Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
      });
    };

    // Log memory usage every 30 seconds
    setInterval(logMemory, 30000);
    
    // Log initial memory usage
    setTimeout(logMemory, 1000);
  }
};

// Bundle size analysis
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') && resource.name.includes('static')
    );
    
    const totalJSSize = jsResources.reduce((total, resource) => 
      total + (resource.transferSize || 0), 0
    );
    
    console.log('[Performance] Bundle Analysis:', {
      totalJSFiles: jsResources.length,
      totalJSSize: `${Math.round(totalJSSize / 1024)} KB`,
      files: jsResources.map(resource => ({
        name: resource.name.split('/').pop(),
        size: `${Math.round((resource.transferSize || 0) / 1024)} KB`,
        cached: resource.transferSize === 0
      }))
    });
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  measurePageLoad();
  measureWebVitals();
  monitorMemoryUsage();
  
  // Analyze bundle size after page load
  window.addEventListener('load', () => {
    setTimeout(analyzeBundleSize, 2000);
  });
};
