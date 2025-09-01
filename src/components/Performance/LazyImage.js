// src/components/Performance/LazyImage.js
import React, { useState, useRef, useEffect } from 'react';
import imageCacheService from '../../services/imageCacheService';
import { getImageUrl } from '../../utils/imageUtils';

const LazyImage = ({
  src,
  alt,
  className = '',
  style = {},
  fallbackSrc = '/placeholder.jpg',
  threshold = 0.1,
  preload = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const currentImg = imgRef.current;
    if (!currentImg) return;

    // Check if image is already cached
    if (imageCacheService.isCached(src)) {
      setIsInView(true);
      setIsLoaded(true);
      return;
    }

    // Preload if requested
    if (preload) {
      setIsInView(true);
      return;
    }

    // Set up intersection observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(currentImg);
          }
        });
      },
      { threshold }
    );

    observerRef.current.observe(currentImg);

    return () => {
      if (observerRef.current && currentImg) {
        observerRef.current.unobserve(currentImg);
      }
    };
  }, [src, threshold, preload]);

  useEffect(() => {
    if (isInView && src && !isLoaded && !hasError) {
      // Preload the image
      imageCacheService.preloadImage(src, 'normal')
        .then(() => {
          setIsLoaded(true);
          onLoad?.();
        })
        .catch((error) => {
          console.error('Failed to load image:', src, error);
          setHasError(true);
          onError?.(error);
        });
    }
  }, [isInView, src, isLoaded, hasError, onLoad, onError]);

  const imageUrl = hasError ? getImageUrl(fallbackSrc) : getImageUrl(src);
  const shouldShow = isInView && (isLoaded || hasError);

  return (
    <div 
      ref={imgRef}
      className={`lazy-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        ...style
      }}
      {...props}
    >
      {/* Placeholder while loading */}
      {!shouldShow && (
        <div 
          className="lazy-image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            color: '#6c757d',
            fontSize: '0.875rem'
          }}
        >
          <div className="loading-spinner">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'spin 1s linear infinite' }}
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
        </div>
      )}

      {/* Actual image */}
      {shouldShow && (
        <img
          src={imageUrl}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
          loading="lazy"
          decoding="async"
        />
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LazyImage;
