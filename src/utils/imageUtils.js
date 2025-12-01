// src/utils/imageUtils.js

export const getImageUrl = (imagePath, size = null, forWhatsApp = false) => {
    // Handle cases where size might be a boolean (from old usage)
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
    
    // Add size parameter if specified and not for WhatsApp
    const sizeParam = (size && !forWhatsApp) ? `?size=${size}` : '';
    
    // Regular path for all images
    const url = `${baseUrl}/${cleanPath}${sizeParam}`;
    
    // Only add cache buster for normal image loading, NOT for WhatsApp sharing
    if (!forWhatsApp && !sizeParam) {
        // Use a static cache buster based on app version only
        // Using dynamic timestamps can cause unnecessary image reloads
        const cacheBuster = process.env.REACT_APP_VERSION || '1.0';
        return `${url}${sizeParam ? '&' : '?'}v=${cacheBuster}`;
    }
    
    return url;
};

// For thumbnail specific usage
export const getThumbnailUrl = (imagePath) => {
    return getImageUrl(imagePath, 'thumbnail');
};

// For backward compatibility
export const getResponsiveImageUrl = (imagePath, size = 'medium') => {
    return getImageUrl(imagePath, size);
};

// Get appropriate image size based on device
export const getResponsiveSizeForImage = (containerWidth = null) => {
    const width = containerWidth || window.innerWidth;
    
    if (width <= 320) return 'thumbnail'; 
    if (width <= 640) return 'small';     
    if (width <= 1024) return 'medium';   
    if (width <= 1600) return 'large';    
    return 'original';
};