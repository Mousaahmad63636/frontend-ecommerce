// src/components/OptimizedImage/OptimizedImage.js
import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  onLoad = () => {}, 
  onError = () => {},
  fallbackSrc = '/placeholder.jpg',
  preventCache = false,
  width, 
  height, 
  loading = 'lazy',
  fetchPriority = 'auto', // Add fetchPriority prop
  ...rest 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  
  // Determine if this is a thumbnail based on size and data attributes
  const isThumbnail = (width && width <= 120) || rest['data-thumbnail'] === 'true';
  
  // Different size parameter approach for thumbnails
  const sizeParam = (width && height) 
    ? isThumbnail 
      ? `size=thumbnail` // Generic thumbnail size for the server to handle
      : `size=${width}x${height}` 
    : '';
  
  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      setImageSrc(fallbackSrc);
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
    
    // Create a processed image URL with optimal parameters
    const baseUrl = getImageUrl(src).split('?')[0];
    const cacheBuster = preventCache ? `t=${Date.now()}` : '';
    
    // For thumbnails, always use a specific size parameter to help CDN caching
    const thumbnailSuffix = isThumbnail ? 'thumb=1&' : '';
    
    const paramConnector = (sizeParam || thumbnailSuffix || cacheBuster) ? '?' : '';
    const params = [thumbnailSuffix, sizeParam, cacheBuster].filter(Boolean).join('&');
    
    const processedSrc = `${baseUrl}${paramConnector}${params}`;
    
    // Set the source immediately for faster perceived loading
    setImageSrc(processedSrc);
    
    // Preload the image
    const img = new Image();
    
    // Set importance based on fetchPriority
    if ('importance' in img) {
      img.importance = fetchPriority; // 'high', 'low', or 'auto'
    }
    
    img.src = processedSrc;
    
    img.onload = () => {
      setIsLoading(false);
      setImageSrc(processedSrc);
      onLoad();
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setHasError(true);
      setIsLoading(false);
      setImageSrc(fallbackSrc);
      onError();
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, preventCache, fallbackSrc, onLoad, onError, sizeParam, isThumbnail, fetchPriority]);
  
  return (
    <div className={`relative ${className}`} style={{...style, width, height}}>
      {/* Simplified loading placeholder for thumbnails */}
      {isLoading && (
        <div 
          className={`absolute inset-0 ${isThumbnail ? 'bg-gray-100' : 'bg-gray-200 animate-pulse'}`}
        ></div>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ ...style, objectFit: style.objectFit || 'cover' }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setImageSrc(fallbackSrc);
        }}
        width={width}
        height={height}
        loading={loading}
        fetchpriority={fetchPriority} // HTML attribute for fetch priority
        {...rest}
      />
      
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className={`${isThumbnail ? 'text-xs' : 'text-sm'} text-gray-500`}>
            {isThumbnail ? '!' : 'Image failed to load'}
          </span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;