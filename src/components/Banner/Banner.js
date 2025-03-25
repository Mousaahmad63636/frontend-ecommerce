// src/components/Banner/Banner.js
import React, { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const Banner = ({ src, alt, title, subtitle, isVideo = false, onLoad, onError }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [containerStyle, setContainerStyle] = useState({});
  const containerRef = useRef(null);
  
  // Calculate container dimensions based on image size and viewport
  useEffect(() => {
    if (isLoaded && dimensions.width > 0 && dimensions.height > 0 && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const aspectRatio = dimensions.height / dimensions.width;
      
      // Determine max height based on viewport
      const viewportHeight = window.innerHeight * 0.8; // 80% of viewport height
      const calculatedHeight = containerWidth * aspectRatio;
      
      // Apply the appropriate height while respecting max height constraints
      const finalHeight = Math.min(calculatedHeight, viewportHeight);
      
      setContainerStyle({
        height: `${finalHeight}px`,
        maxHeight: `${viewportHeight}px`
      });
    }
  }, [isLoaded, dimensions, containerRef]);
  
  const handleLoad = (e) => {
    // Capture natural image dimensions
    if (e.target) {
      setDimensions({
        width: e.target.naturalWidth,
        height: e.target.naturalHeight
      });
    }
    
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  const handleError = () => {
    setHasError(true);
    if (onError) onError();
    console.error('Failed to load banner image:', src);
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden transition-all duration-300"
      style={containerStyle}
    >
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
          className={`w-full h-full object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
     {/* Overlay with text - removed bg-black/40 */}
<div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
  {title && <h1 className="text-4xl md:text-5xl font-bold mb-4 text-shadow-lg">{title}</h1>}
  {subtitle && <p className="text-xl md:text-2xl max-w-2xl text-shadow-md">{subtitle}</p>}
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