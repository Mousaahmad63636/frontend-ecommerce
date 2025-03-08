// src/utils/formatters.js

/**
 * Formats a phone number for WhatsApp to ensure proper compatibility with desktop and mobile apps
 * Handles Lebanese phone numbers with various prefixes (03, 81, 71, etc.)
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
    // This is a local number without country code (like 81123456)
    return `961${digits}`;
  }
  
  if (digits.length === 9 && digits.startsWith('0')) {
    // Format like 03xxxxxx - remove the leading zero and add country code
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