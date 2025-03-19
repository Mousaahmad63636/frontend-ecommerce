// src/components/OptimizedImage/OptimizedImage.js
import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width = '100%',
  height = 'auto',
  objectFit = 'cover',
  lazyLoad = true,
  placeholderSrc = '/placeholder.jpg',
  onLoad = () => {},
  onError = () => {}
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    // Reset states when src changes
    setLoaded(false);
    setError(false);
    
    if (!src) {
      setError(true);
      setImageSrc(placeholderSrc);
      return;
    }

    // Use optimized image URL if possible
    setImageSrc(getImageUrl(src));

    // Preload the image
    const img = new Image();
    img.src = getImageUrl(src);
    
    img.onload = () => {
      setLoaded(true);
      onLoad();
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', src);
      setError(true);
      setImageSrc(placeholderSrc);
      onError();
    };
  }, [src, placeholderSrc, onLoad, onError]);

  return (
    <div 
      className={`optimized-image-container ${className}`}
      style={{ 
        width, 
        height,
        position: 'relative',
        overflow: 'hidden',
        background: '#f0f0f0'
      }}
    >
      {!loaded && !error && (
        <div 
          className="image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f7f7f7'
          }}
        >
          <div 
            className="loading-shimmer"
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              position: 'absolute'
            }}
          />
        </div>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        loading={lazyLoad ? "lazy" : "eager"}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          position: 'relative'
        }}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setImageSrc(placeholderSrc);
        }}
      />
      
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default OptimizedImage;