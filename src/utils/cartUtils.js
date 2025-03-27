export const openSideCart = () => {
  const event = new CustomEvent('openSideCart');
  document.dispatchEvent(event);
  
  // Also set the global variable for components that might check it
  window.isSideCartOpen = true;
};

/**
 * Utility to close the side cart from anywhere in the application
 */
export const closeSideCart = () => {
  const event = new CustomEvent('closeSideCart');
  document.dispatchEvent(event);
  
  // Update global variable
  window.isSideCartOpen = false;
};