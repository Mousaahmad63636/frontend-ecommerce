import React from 'react';
import './ConsultingFloat.css';

function ConsultingFloat() {
  const phoneNumber = '96171195068';
  const message = encodeURIComponent('مرحبا اريد استشارة');

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