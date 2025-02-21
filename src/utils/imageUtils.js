export const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/300@3x.png';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove any leading slash and 'uploads/' from the stored path
    const cleanPath = imagePath
        .replace(/^\//, '')         // Remove leading slash
        .replace(/^uploads\//, ''); // Remove 'uploads/' if present
    
    // Construct the full URL using the base URL
    const baseUrl = process.env.REACT_APP_UPLOAD_URL;
    const url = `${baseUrl}/${cleanPath}`;
    
    // Add cache buster
    const cacheBuster = `?v=${Date.now()}`;
    
    console.log('Constructed image URL:', url + cacheBuster); // Debug log
    return url + cacheBuster;
};