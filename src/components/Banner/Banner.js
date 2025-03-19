// src/components/Banner/Banner.js
import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const Banner = ({ 
  src, 
  alt = "Banner image",
  title,
  subtitle,
  height = "auto",
  isVideo = false,
  onLoad = () => {},
  onError = () => {} 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad();
  };

  const handleError = () => {
    setHasError(true);
    onError();
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {/* Loading state - gray background with subtle animation */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}

      {/* Actual media */}
      {isVideo ? (
        // Video banner
        <video
          src={getImageUrl(src)}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={handleLoad}
          onError={handleError}
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
      ) : (
        // Image banner
        <img
          src={getImageUrl(src)}
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={handleLoad}
          onError={handleError}
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
      )}

      {/* Error state - show fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <svg 
              className="w-12 h-12 mx-auto text-gray-400 mb-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-gray-600">Unable to load banner</p>
          </div>
        </div>
      )}

      {/* Text overlay - only show when loaded and if title or subtitle exists */}
      {isLoaded && !hasError && (title || subtitle) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-40 p-6">
          {title && (
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center max-w-4xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-lg md:text-xl text-center max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Banner;