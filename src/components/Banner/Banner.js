// src/components/Banner/Banner.js
import React, { useState } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const Banner = ({ src, alt, title, subtitle, isVideo = false, onLoad, onError }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  const handleError = () => {
    setHasError(true);
    if (onError) onError();
    console.error('Failed to load banner image:', src);
  };
  
  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      
      {isVideo ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
          onLoadedData={handleLoad}
          onError={handleError}
        />
      ) : (
        <img
          src={getImageUrl(src)}
          alt={alt || "Banner image"}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Overlay with text */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-6 text-center">
        {title && <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>}
        {subtitle && <p className="text-xl md:text-2xl max-w-2xl">{subtitle}</p>}
      </div>
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-500 mb-2">Failed to load image</p>
            <button 
              onClick={() => {
                setHasError(false);
                setIsLoaded(false);
                // Force reload by creating a new image with cache buster
                const img = new Image();
                img.src = `${getImageUrl(src).split('?')[0]}?t=${Date.now()}`;
                img.onload = handleLoad;
                img.onerror = handleError;
              }}
              className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banner;