// src/components/Banner/Banner.js
import React, { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const Banner = ({ src, alt, title, subtitle, isVideo = false, onLoad, onError }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(9 / 16); // Default aspect ratio
  const containerRef = useRef(null);

  // Process video URLs the same way we process image URLs
  const getMediaUrl = (path) => {
    // For videos, check if it's already an absolute URL first
    if (isVideo) {
      if (path && (path.startsWith('http') || path.startsWith('blob:'))) {
        return path;
      }

      // Handle path processing for videos
      if (!path) return null;

      // Remove any leading slash and 'uploads/' from the stored path
      const cleanPath = path
        .replace(/^\//, '')
        .replace(/^uploads\//, '');

      // Base URL for media
      const baseUrl = process.env.REACT_APP_UPLOAD_URL || 'https://spotlylb.com/uploads';
      return `${baseUrl}/${cleanPath}`;
    }

    // For images, use the existing getImageUrl function
    return getImageUrl(path);
  };

  // Initialize resize observer to maintain aspect ratio
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerWidth * aspectRatio;
        containerRef.current.style.height = `${containerHeight}px`;
      }
    };

    // Initial sizing
    handleResize();

    // Set up resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [aspectRatio]);

  const handleLoad = (e) => {
    if (e.target) {
      // Get natural dimensions from the target element
      const width = e.target.naturalWidth || e.target.videoWidth || 16;
      const height = e.target.naturalHeight || e.target.videoHeight || 9;

      // Update aspect ratio
      setAspectRatio(height / width);
    }

    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
    console.error(`Failed to load banner ${isVideo ? 'video' : 'image'}:`, src);
  };

  const mediaUrl = getMediaUrl(src);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden transition-all duration-300"
      style={{
        // Minimum height as fallback
        minHeight: '300px',
        // Max height to prevent excessive vertical space on large screens
        maxHeight: '80vh'
      }}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}

      {isVideo ? (
        <video
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={handleLoad}
          onLoadedMetadata={handleLoad}
          onError={handleError}
        />
      ) : (
        <img
          src={mediaUrl}
          alt={alt || "Banner image"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Overlay with text - with semi-transparent background to ensure readability */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
        {title && <h1 className="text-4xl md:text-5xl font-bold mb-4 text-shadow-lg">{title}</h1>}
        {subtitle && <p className="text-xl md:text-2xl max-w-2xl text-shadow-md">{subtitle}</p>}
      </div>

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-500 mb-2">Failed to load {isVideo ? 'video' : 'image'}</p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoaded(false);
                // Force reload
                if (!isVideo) {
                  const img = new Image();
                  img.src = `${mediaUrl.split('?')[0]}?t=${Date.now()}`;
                  img.onload = handleLoad;
                  img.onerror = handleError;
                }
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