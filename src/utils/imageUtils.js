// src/utils/imageUtils.js
export const getImageUrl = (imagePath, size = null, forWhatsApp = false) => {
    // Handle cases where size might be a boolean (from old usage where second param was forWhatsApp)
    if (typeof size === 'boolean') {
        forWhatsApp = size;
        size = null;
    }

    if (!imagePath) return '/placeholder.jpg';
    
    // If already absolute URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove any leading slash and 'uploads/' from the stored path
    const cleanPath = imagePath
        .replace(/^\//, '')         // Remove leading slash
        .replace(/^uploads\//, ''); // Remove 'uploads/' if present
    
    // Base URL for images
    const baseUrl = process.env.REACT_APP_UPLOAD_URL || 'https://spotlylb.com/uploads';
    
    // IMPORTANT: Check if the optimized endpoint exists - for now, don't use it
    // This will make the code backward compatible until the server endpoint is ready
    // if (size && !forWhatsApp) {
    //     // Use the new optimized endpoint with size
    //     return `${baseUrl}/optimized/${size}/${cleanPath}`;
    // }
    
    // Regular path for all images (both optimized and non-optimized)
    const url = `${baseUrl}/${cleanPath}`;
    
    // Only add cache buster for normal image loading, NOT for WhatsApp sharing
    if (!forWhatsApp) {
        // Use a more efficient cache busting approach with a version parameter
        const cacheBuster = process.env.REACT_APP_VERSION || '1.0';
        return `${url}?v=${cacheBuster}`;
    }
    
    return url;
};

// Get appropriate image size based on device/container size
export const getResponsiveSizeForImage = (containerWidth = null) => {
    // If container width is not provided, estimate based on screen size
    const width = containerWidth || window.innerWidth;
    
    if (width <= 320) return 'thumbnail'; // Small mobile
    if (width <= 640) return 'small';     // Mobile
    if (width <= 1024) return 'medium';   // Tablet
    if (width <= 1600) return 'large';    // Desktop
    return 'original';                   // Large desktop or unknown
};

// For backward compatibility
export const getResponsiveImageUrl = (imagePath, size = 'medium') => {
    return getImageUrl(imagePath, size);
};

// Preload important images (call this for critical images)
export const preloadImage = (src) => {
    if (!src) return;
    
    const img = new Image();
    img.src = getImageUrl(src);
    
    return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
    });
};