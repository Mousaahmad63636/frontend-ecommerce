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
    const baseUrl = 'https://spotlylb.com/uploads';
    
    // Construct the full URL using the base URL
    const url = `${baseUrl}/${cleanPath}`;
    
    // Only add cache buster for normal image loading, not for WhatsApp
    if (!forWhatsApp) {
        return `${url}?v=${Date.now()}`;
    }
    
    // For WhatsApp, return a clean URL
    return url;
};