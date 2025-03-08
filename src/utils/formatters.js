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

/**
 * Formats a Lebanese phone number for WhatsApp using the E.164 standard
 * Handles all Lebanese prefixes (03, 71, 76, 78, 81, 79, 86)
 * 
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - The formatted phone number for WhatsApp
 */
export const formatPhoneForWhatsApp = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove any non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If it already includes the country code with leading zeros
  if (digits.startsWith('00961')) {
    return digits.substring(2); // Remove the '00' prefix
  }
  
  // If it already includes the country code without leading zeros
  if (digits.startsWith('961')) {
    return digits;
  }
  
  // Handle the case where number starts with 0 (like 03xxxxxx)
  if (digits.startsWith('0')) {
    return '961' + digits.substring(1);
  }
  
  // Lebanese mobile prefixes - must check these explicitly
  const lebanesePrefixes = ['03', '71', '76', '78', '81', '79', '86'];
  
  // Check if it's a Lebanese number without leading 0
  for (const prefix of lebanesePrefixes) {
    // Check if it starts with the prefix (without 0)
    if (digits.startsWith(prefix.substring(1)) && digits.length === 7) {
      return '961' + digits;
    }
    
    // Check if it starts with the prefix (with 0)
    if (digits.startsWith(prefix) && digits.length === 8) {
      return '961' + digits.substring(1);
    }
  }
  
  // Handle international format with + (which would be removed by regex)
  if (digits.length === 11 && digits.startsWith('961')) {
    return digits;
  }
  
  // For any other case, assume it might be a Lebanese number and add country code
  // If it's already 8 digits, assume it's a complete number without country code
  if (digits.length === 8) {
    return '961' + digits;
  }
  
  // Default - just return the number as is
  return digits;
};