// src/utils/formatters.js

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

export const formatPhoneForWhatsApp = (phone) => {
  // Remove any non-digit characters
  let cleaned = ('' + phone).replace(/\D/g, '');
  
  // Special case for "81" prefixed numbers
  if (cleaned.startsWith('81') && cleaned.length === 8) {
    return '961' + cleaned;
  }
  
  // Handle Lebanese numbers with 03, 71, 76, etc.
  if ((cleaned.startsWith('03') || 
       cleaned.startsWith('71') || 
       cleaned.startsWith('76') || 
       cleaned.startsWith('78') ||
       cleaned.startsWith('79') ||
       cleaned.startsWith('86')) && 
      cleaned.length === 8) {
    return '961' + cleaned.substring(1);
  }
  
  // Handle numbers that already start with 961
  else if (cleaned.startsWith('961')) {
    return cleaned;
  }
  
  // Handle numbers that start with 00961
  else if (cleaned.startsWith('00961')) {
    return cleaned.substring(2); // Remove the leading 00
  }
  
  // Default case - if it's 8 digits, assume it's a Lebanese number
  else if (cleaned.length === 8) {
    return '961' + cleaned;
  }
  
  // If nothing matches, just return the cleaned number
  return cleaned;
};