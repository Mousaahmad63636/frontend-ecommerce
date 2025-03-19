// src/utils/imageUtils.js
export const getImageUrl = (imagePath, forWhatsApp = false) => {
    if (!imagePath) return '/placeholder.jpg';
    
    // If already absolute URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove any leading slash and 'uploads/' from the stored path
    const cleanPath = imagePath
        .replace(/^\//, '')         // Remove leading slash
        .replace(/^uploads\//, ''); // Remove 'uploads/' if present
    
    // Base URL for images
    const baseUrl = process.env.REACT_APP_UPLOAD_URL || 'https://spotlylb.com/uploads';
    
    // Construct the full URL using the base URL
    const url = `${baseUrl}/${cleanPath}`;
    
    // Only add cache buster for normal image loading, NOT for WhatsApp sharing
    if (!forWhatsApp) {
        // Use a more efficient cache busting approach with a version parameter
        // that doesn't change with every page load
        const cacheBuster = process.env.REACT_APP_VERSION || '1.0';
        return `${url}?v=${cacheBuster}`;
    }
    
    return url;
};

// Get responsive image URL based on screen size
export const getResponsiveImageUrl = (imagePath, size = 'medium') => {
    if (!imagePath) return '/placeholder.jpg';
    
    // If already absolute URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    const baseUrl = process.env.REACT_APP_UPLOAD_URL || 'https://spotlylb.com/uploads';
    const cleanPath = imagePath
        .replace(/^\//, '')
        .replace(/^uploads\//, '');
    
    // For now, we'll just return the regular URL since the backend resize API
    // is not yet implemented, but this function will make it easy to switch later
    const url = `${baseUrl}/${cleanPath}`;
    const cacheBuster = process.env.REACT_APP_VERSION || '1.0';
    
    return `${url}?v=${cacheBuster}`;
};