// src/utils/cartUtils.js
export const openSideCart = () => {
  const event = new CustomEvent('openSideCart');
  document.dispatchEvent(event);
  
  // Also set the global variable for components that might check it
  window.isSideCartOpen = true;
};

export const closeSideCart = () => {
  const event = new CustomEvent('closeSideCart');
  document.dispatchEvent(event);
  
  // Update global variable
  window.isSideCartOpen = false;
};