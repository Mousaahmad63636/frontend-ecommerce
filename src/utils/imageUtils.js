// src/utils/imageUtils.js
export const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300';
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imagePath}`;
};