export const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/300@3x.png';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove leading slash if present and remove 'uploads' if it exists in the path
    const cleanPath = imagePath.replace(/^\//, '').replace(/^uploads\//, '');
    
    return `${process.env.REACT_APP_UPLOAD_URL}/${cleanPath}`;
};