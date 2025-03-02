// Update your src/utils/imageUtils.js file

export const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://spotlylb.com/placeholder.jpg';
    
    // If already absolute URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove any leading slash and 'uploads/' from the stored path
    const cleanPath = imagePath
        .replace(/^\//, '')         // Remove leading slash
        .replace(/^uploads\//, ''); // Remove 'uploads/' if present
    
    // Always use absolute URLs for OpenGraph compatibility
    const baseUrl = process.env.REACT_APP_UPLOAD_URL || 'https://spotlylb.com/uploads';
    
    // Construct the full URL using the base URL
    const url = `${baseUrl}/${cleanPath}`;
    
    // Add cache buster to prevent caching issues
    const cacheBuster = `?v=${Date.now()}`;
    
    console.log('Constructed image URL:', url); // Debug log
    return url;
};