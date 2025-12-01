// src/components/Notification/Notification.js
import React from 'react';

const Notification = ({ id, type, message, onClose }) => {
  // Define icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle" style={{ color: '#ef4444' }}></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b' }}></i>;
      case 'info':
      default:
        return <i className="fas fa-info-circle" style={{ color: '#3b82f6' }}></i>;
    }
  };

  // Get title based on notification type
  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
      default:
        return 'Information';
    }
  };

  return (
    <div 
      id={`notification-${id}`}
      className={`notification ${type}`}
      role="alert"
    >
      <div className="notification-icon">
        {getIcon()}
      </div>
      <div className="notification-content">
        <div className="notification-title">{getTitle()}</div>
        <div className="notification-message">{message}</div>
      </div>
      <button 
        className="notification-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Notification;