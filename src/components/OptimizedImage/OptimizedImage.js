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
  ...rest 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  
  // Simple flag to detect if this is a thumbnail
  const isThumbnail = rest['data-thumbnail'] === 'true';
  
  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      setImageSrc(fallbackSrc);
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
    
    // Use a simple, reliable approach to get the image URL
    // Avoid adding any parameters that might not be supported by your backend
    const processedSrc = getImageUrl(src);
    
    // For debugging - log the actual URL being used
    if (isThumbnail) {
      console.log(`Thumbnail URL for ${alt || 'image'}: ${processedSrc}`);
    }
    
    // Set the source immediately for faster perceived loading
    setImageSrc(processedSrc);
    
    // Preload the image
    const img = new Image();
    img.src = processedSrc;
    
    img.onload = () => {
      setIsLoading(false);
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
  }, [src, alt, isThumbnail, preventCache, fallbackSrc, onLoad, onError]);
  
  return (
    <div className={`relative ${className}`} style={{...style, width, height}}>
      {/* Only show loading state if not a thumbnail - for thumbnails we want immediate display */}
      {isLoading && !isThumbnail && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300`}
        style={{ 
          ...style, 
          objectFit: style.objectFit || 'cover',
          // Don't hide thumbnails during loading
          opacity: (isLoading && !isThumbnail) ? 0 : 1
        }}
        width={width}
        height={height}
        loading={loading}
        {...rest}
      />
      
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">
            Image failed to load
          </span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;