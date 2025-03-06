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
  
  // Handle Lebanese numbers
  if (cleaned.startsWith('03') && cleaned.length === 8) {
    // Convert 03XXXXXX to 9613XXXXXX
    return '961' + cleaned.substring(1);
  } 
  // Handle numbers that already start with 961
  else if (cleaned.startsWith('961')) {
    return cleaned;
  }
  // Handle numbers that start with +961 (the + will be removed by the regex above)
  else if (cleaned.startsWith('961')) {
    return cleaned;
  }
  // Handle numbers that start with 00961
  else if (cleaned.startsWith('00961')) {
    return cleaned.substring(2); // Remove the leading 00
  }
  // Default case - just return the cleaned number
  return cleaned;
};