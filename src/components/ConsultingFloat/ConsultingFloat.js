// src/components/ConsultingFloat/ConsultingFloat.js
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
      <div className="consulting-text">استشر خبيرة التجميل مجانا</div>
      <div className="tooltip">Chat with our beauty expert!</div>
    </div>
  );
}

export default ConsultingFloat;