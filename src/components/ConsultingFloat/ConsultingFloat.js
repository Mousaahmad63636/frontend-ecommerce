import React from 'react';
import './ConsultingFloat.css';

function ConsultingFloat() {
  const phoneNumber = '96176919370';
  const message = encodeURIComponent(' hello Spotly, I need help.');

  const handleClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

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