export const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/300@3x.png';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Clean the path
    const cleanPath = imagePath.replace(/^\//, '').replace(/^uploads\//, '');
    
    // Add cache buster to prevent caching issues
    const cacheBuster = `?v=${Date.now()}`;
    return `${process.env.REACT_APP_UPLOAD_URL}/${cleanPath}${cacheBuster}`;
};