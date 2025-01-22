// src/utils/imageUtils.js
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    return `${process.env.REACT_APP_UPLOAD_URL}${imagePath}`;
};