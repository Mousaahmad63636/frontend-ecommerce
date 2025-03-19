// src/components/Banner.js
import React, { useState, useEffect } from 'react';
import OptimizedImage from '../OptimizedImage';
import { getImageUrl } from '../utils/imageUtils';

const Banner = ({ src, alt, title, subtitle, isVideo = false, onLoad, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Force reload feature for problematic images
  const [forceReload, setForceReload] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setLoading(true);
    setError(false);
    setForceReload(false);
  }, [src]);

  const handleImageError = () => {
    console.error('Banner image failed to load:', src);
    setError(true);
    setLoading(false);
    onError && onError();
    
    // Try one forced reload with cache busting if initial load fails
    if (!forceReload) {
      console.log('Attempting to force reload the banner image');
      setForceReload(true);
    }
  };

  const handleImageLoad = () => {
    setLoading(false);
    onLoad && onLoad();
  };

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {isVideo ? (
        // Video content
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        // Image content with OptimizedImage
        <OptimizedImage
          src={src}
          alt={alt || "Banner image"}
          className="absolute inset-0 w-full h-full object-cover"
          preventCache={forceReload} // Use cache busting if force reloading
          onLoad={handleImageLoad}
          onError={handleImageError}
          fallbackSrc="/hero.jpg" // Fallback to a local hero image
        />
      )}
      
      {/* Overlay and text */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-6 text-center">
        {title && <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>}
        {subtitle && <p className="text-xl md:text-2xl max-w-2xl">{subtitle}</p>}
      </div>
      
      {/* Error state overlay */}
      {error && !loading && (
        <div className="absolute inset-0 bg-gray-800/80 flex flex-col items-center justify-center text-white p-6">
          <p className="text-xl mb-4">Failed to load banner image</p>
          <button 
            onClick={() => {
              setForceReload(true);
              setLoading(true);
              setError(false);
            }}
            className="px-4 py-2 bg-primary-600 rounded hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Banner;