// src/constants/index.js
export const ORDER_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
  };
  
  export const PROMO_CODES = {
    'WELCOME10': {
      discount: 10,
      description: '10% off your first order'
    },
    'SAVE20': {
      discount: 20,
      description: '20% off on all items'
    },
    'FREESHIP': {
      type: 'shipping',
      discount: 100,
      description: 'Free shipping on your order'
    }
  };
  
  export const SHIPPING_FEE = 5;
  
  export const VALIDATION_RULES = {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    phone: {
      pattern: /^\+?[\d\s-]{10,}$/,
      message: 'Please enter a valid phone number'
    },
    password: {
      minLength: 8,
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      message: 'Password must be at least 8 characters and contain both letters and numbers'
    }
  };