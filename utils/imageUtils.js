export const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/300@3x.png';
    return `https://backend-ecommerce-z7ih.onrender.com${imagePath}`;
};