// src/components/OptimizedImage.js
import React, { useState, useEffect } from 'react';
import { loadImage, getImageUrl } from '../utils/imageUtils';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  onLoad = () => {}, 
  onError = () => {},
  fallbackSrc = '/placeholder.jpg',
  preventCache = false,
  ...rest 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Create a processed image URL
    const processedSrc = preventCache 
      ? `${getImageUrl(src).split('?')[0]}?t=${Date.now()}` 
      : getImageUrl(src);
    
    // First set the source - this might be enough for simple cases
    setImageSrc(processedSrc);
    
    // Also try to preload the image
    const img = new Image();
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
  }, [src, preventCache, fallbackSrc, onLoad, onError]);
  
  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ ...style, objectFit: 'cover' }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setImageSrc(fallbackSrc);
        }}
        {...rest}
      />
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">Image failed to load</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;