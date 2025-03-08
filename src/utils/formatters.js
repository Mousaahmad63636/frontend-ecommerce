// src/utils/formatters.js

/**
 * Formats a price value to a consistent display format
 * @param {number} price - The price value to format
 * @param {string} currency - The currency symbol (default: $)
 * @returns {string} - Formatted price with currency symbol
 */
export const formatPrice = (price, currency = '$') => {
  if (price === undefined || price === null) return `${currency}0.00`;
  return `${currency}${Number(price).toFixed(2)}`;
};

/**
 * Formats a phone number for WhatsApp to ensure proper compatibility 
 * Handles Lebanese phone numbers with various prefixes
 * 
 * @param {string} phoneNumber - The original phone number
 * @returns {string} - Properly formatted phone number for WhatsApp
 */
export const formatPhoneForWhatsApp = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove any non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // Handle different Lebanese number formats
  if (digits.length === 8) {
    // This is a local number without country code (like 81123456 or 71123456)
    return `961${digits}`;
  }
  
  if (digits.length === 10 && digits.startsWith('03')) {
    // This is a number starting with 03 area code - convert to international format
    return `961${digits.substring(1)}`;
  }
  
  if (digits.length === 9 && digits.startsWith('0')) {
    // Format like 03xxxxxx or 01xxxxxx - remove the leading zero and add country code
    return `961${digits.substring(1)}`;
  }
  
  if (digits.length === 10 && digits.startsWith('961')) {
    // Already has country code correctly
    return digits;
  }
  
  if (digits.length === 11 && digits.startsWith('9610')) {
    // Has country code but with an extra 0
    return `961${digits.substring(4)}`;
  }

  // If no specific rule matches, just ensure 961 prefix is present
  if (!digits.startsWith('961')) {
    return `961${digits}`;
  }
  
  return digits;
};

/**
 * Formats a date string to a human-readable format
 * 
 * @param {string|Date} dateString - Date string or Date object to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) return '';
  
  // Default options
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  // Merge default options with provided options
  const formatOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
};