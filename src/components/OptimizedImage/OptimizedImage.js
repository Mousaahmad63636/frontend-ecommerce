// src/components/OptimizedImage/OptimizedImage.js
import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUtils';
import './OptimizedImage.css';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  objectFit = 'cover',
  placeholderSrc = '/placeholder.jpg',
  lazyLoad = true,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(lazyLoad ? placeholderSrc : null);

  useEffect(() => {
    // If not using lazy loading, set the source immediately
    if (!lazyLoad) {
      setImageSrc(src ? getImageUrl(src) : placeholderSrc);
      return;
    }

    // If using lazy loading, set up IntersectionObserver
    const imgElement = document.querySelector(`[data-src="${src}"]`);
    if (!imgElement) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setImageSrc(src ? getImageUrl(src) : placeholderSrc);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '200px 0px', // Start loading when image is 200px from viewport
      threshold: 0.01
    });

    observer.observe(imgElement);

    return () => {
      if (imgElement) observer.unobserve(imgElement);
    };
  }, [src, placeholderSrc, lazyLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    setError(true);
    setImageSrc(placeholderSrc);
    if (onError) onError(e);
  };

  return (
    <div 
      className={`optimized-image-container ${className}`} 
      style={{ width, height, position: 'relative' }}
      data-src={src}
    >
      {(!isLoaded && !error) && (
        <div className="image-skeleton-loader"></div>
      )}
      <img
        src={imageSrc || placeholderSrc}
        alt={alt}
        className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazyLoad ? "lazy" : "eager"}
        style={{ objectFit }}
      />
    </div>
  );
};

export default OptimizedImage;