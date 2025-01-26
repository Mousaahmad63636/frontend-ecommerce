// src/components/Notification/Notification.js
import React, { useEffect } from 'react';
import './Notification.css';

function Notification({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );
}

export default Notification;