// src/utils/imageUtils.js
export const getImageUrl = (imagePath, forWhatsApp = false) => {
    if (!imagePath) return 'https://spotlylb.com/placeholder.jpg';
    
    // If already absolute URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove any leading slash and 'uploads/' from the stored path
    const cleanPath = imagePath
        .replace(/^\//, '')         // Remove leading slash
        .replace(/^uploads\//, ''); // Remove 'uploads/' if present
    
    // Always use absolute URLs for OpenGraph compatibility
    // Keep using your existing image source location
    const baseUrl = process.env.REACT_APP_UPLOAD_URL || 'https://spotlylb.com/uploads';
    
    // Construct the full URL using the base URL
    const url = `${baseUrl}/${cleanPath}`;
    
    // Only add cache buster for normal image loading, NOT for WhatsApp sharing
    if (!forWhatsApp) {
        // Add cache buster to prevent caching issues for normal browsing
        const urlWithCacheBuster = `${url}?v=${Date.now()}`;
        console.log('Constructed image URL with cache buster:', urlWithCacheBuster);
        return urlWithCacheBuster;
    }
    
    // For WhatsApp sharing, return URL without cache buster
    if (forWhatsApp) {
        console.log('WhatsApp sharing image URL (no cache buster):', url);
    } else {
        console.log('Constructed image URL:', url);
    }
    
    return url;
};