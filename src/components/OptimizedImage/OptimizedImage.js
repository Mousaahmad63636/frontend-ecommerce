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
  width, // Add width prop
  height, // Add height prop
  loading = 'lazy', // Add loading prop with default
  ...rest 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  
  // Create size attribute string for URL if dimensions provided
  const sizeParam = (width && height) ? `&size=${width}x${height}` : '';
  
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Create a processed image URL with size parameters if provided
    const baseUrl = getImageUrl(src).split('?')[0];
    const cacheBuster = preventCache ? `t=${Date.now()}` : '';
    const paramConnector = (sizeParam || cacheBuster) ? '?' : '';
    const params = [sizeParam, cacheBuster].filter(Boolean).join('&');
    
    const processedSrc = `${baseUrl}${paramConnector}${params}`;
    
    // Set the source immediately for faster perceived loading
    setImageSrc(processedSrc);
    
    // Preload the image
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
  }, [src, preventCache, fallbackSrc, onLoad, onError, sizeParam]);
  
  return (
    <div className={`relative ${className}`} style={{...style, width, height}}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
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