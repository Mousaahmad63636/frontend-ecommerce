// src/utils/imageUtils.js
const DEBUG_IMAGES = false; // Set to true to enable console logs for image loading

export const getImageUrl = (imagePath, size = null, forWhatsApp = false) => {
    // For debugging
    if (DEBUG_IMAGES) console.log(`Getting image URL for: ${imagePath}, size: ${size}`);
    
    // Handle cases where size might be a boolean (from old usage)
    if (typeof size === 'boolean') {
        forWhatsApp = size;
        size = null;
    }

    if (!imagePath) {
        if (DEBUG_IMAGES) console.log('No image path provided, using placeholder');
        return '/placeholder.jpg';
    }
    
    // If already absolute URL, return as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Remove any leading slash and 'uploads/' from the stored path
    const cleanPath = imagePath
        .replace(/^\//, '')         // Remove leading slash
        .replace(/^uploads\//, ''); // Remove 'uploads/' if present
    
    // Base URL for images
    const baseUrl = process.env.REACT_APP_UPLOAD_URL || 'https://spotlylb.com/uploads';
    
    // Regular path for all images
    const url = `${baseUrl}/${cleanPath}`;
    
    // Only add cache buster for normal image loading, NOT for WhatsApp sharing
    if (!forWhatsApp) {
        // More random cache buster to prevent stale images
        const cacheBuster = `${process.env.REACT_APP_VERSION || '1.0'}.${Date.now().toString().slice(-6)}`;
        return `${url}?v=${cacheBuster}`;
    }
    
    return url;
};

// Create an image loader function that returns a promise
export const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        if (!src) {
            reject(new Error('No image source provided'));
            return;
        }
        
        const img = new Image();
        const imageUrl = getImageUrl(src);
        
        img.onload = () => {
            if (DEBUG_IMAGES) console.log(`Successfully loaded image: ${imageUrl}`);
            resolve(imageUrl);
        };
        
        img.onerror = () => {
            console.error(`Failed to load image: ${imageUrl}`);
            reject(new Error(`Failed to load image: ${src}`));
        };
        
        img.src = imageUrl;
    });
};

// For backward compatibility
export const getResponsiveImageUrl = (imagePath, size = 'medium') => {
    return getImageUrl(imagePath, size);
};

// Get appropriate image size based on device/container size
export const getResponsiveSizeForImage = (containerWidth = null) => {
    // If container width is not provided, estimate based on screen size
    const width = containerWidth || window.innerWidth;
    
    if (width <= 320) return 'thumbnail'; // Small mobile
    if (width <= 640) return 'small';     // Mobile
    if (width <= 1024) return 'medium';   // Tablet
    if (width <= 1600) return 'large';    // Desktop
    return 'original';                    // Large desktop or unknown
};

// Check if image exists before attempting to load it
export const checkImageExists = async (src) => {
    try {
        const response = await fetch(getImageUrl(src), { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Error checking if image exists:', error);
        return false;
    }
};

// Force reload an image by adding a timestamp
export const forceReloadImage = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    
    const baseUrl = getImageUrl(imagePath).split('?')[0];
    return `${baseUrl}?t=${Date.now()}`;
};