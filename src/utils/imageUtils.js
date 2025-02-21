export const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/300@3x.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_UPLOAD_URL}${imagePath}`;
};