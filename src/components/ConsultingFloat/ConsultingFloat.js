// src/components/ConsultingFloat/ConsultingFloat.js
import React, { useState, useEffect } from 'react';
import './ConsultingFloat.css';

function ConsultingFloat() {
  const phoneNumber = '96176919370';
  const message = encodeURIComponent('Hello Spotly, I need help.');
  const [isHidden, setIsHidden] = useState(false);

  // Listen for side cart state changes
  useEffect(() => {
    // Initialize based on current state (if cart was already open)
    setIsHidden(window.isSideCartOpen === true);

    // Setup event listener for future changes
    const handleSideCartStateChange = (event) => {
      setIsHidden(event.detail.isOpen);
    };

    document.addEventListener('sideCartStateChange', handleSideCartStateChange);

    // Clean up event listener
    return () => {
      document.removeEventListener('sideCartStateChange', handleSideCartStateChange);
    };
  }, []);

  const handleClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  // Don't render if it should be hidden
  if (isHidden) {
    return null;
  }

  return (
    <div className="consulting-float" onClick={handleClick}>
      <div className="consulting-icon">
        <i className="fab fa-whatsapp"></i>
      </div>
      <div className="tooltip">Shop on WhatsApp</div>
    </div>
  );
}

export default ConsultingFloat;