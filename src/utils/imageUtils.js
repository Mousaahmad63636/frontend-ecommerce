// src/utils/imageUtils.js
export const getImageUrl = (imagePath, forWhatsApp = false) => {
    if (!imagePath) return 'https://spotlylb.com/placeholder.jpg';
    
    // If already absolute URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove any leading slash and 'uploads/' from the stored path
    const cleanPath = imagePath
        .replace(/^\//, '')         // Remove leading slash
        .replace(/^uploads\//, ''); // Remove 'uploads/' if present
    
    // Always use absolute URLs for proper sharing
    // This must be your actual domain, not localhost
    const baseUrl = 'https://spotlylb.com/uploads';
    
    // Construct the full URL using the base URL
    const url = `${baseUrl}/${cleanPath}`;
    
    if (forWhatsApp) {
        console.log('WhatsApp sharing image URL:', url);
    }
    
    // Remove cache buster for WhatsApp crawling to work correctly
    return url;
};