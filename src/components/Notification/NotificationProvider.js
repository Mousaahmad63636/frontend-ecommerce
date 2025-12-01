// src/components/Notification/NotificationProvider.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Notification from './Notification';
import './Notification.css';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Reduce default timeout from 5000ms to 3000ms (3 seconds)
  const showNotification = useCallback((message, type = 'info', timeout = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    
    setNotifications(prev => [...prev, { id, message, type, timeout }]);
    
    // Auto-dismiss after timeout
    if (timeout !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      // Find the notification element
      const notificationElement = document.getElementById(`notification-${id}`);
      
      // Add fadeOut animation if element exists
      if (notificationElement) {
        notificationElement.style.animation = 'fadeOut 0.3s forwards';
        
        // Wait for animation to finish before removing from state
        setTimeout(() => {
          setNotifications(prev => prev.filter(notification => notification.id !== id));
        }, 300);
        return prev;
      }
      
      // If element doesn't exist, just remove from state
      return prev.filter(notification => notification.id !== id);
    });
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Clear notifications when route changes
  useEffect(() => {
    return () => {
      setNotifications([]);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification, clearNotifications }}>
      {children}
      <div className="notification-container">
        {notifications.map(({ id, message, type }) => (
          <Notification
            key={id}
            id={id}
            message={message}
            type={type}
            onClose={() => removeNotification(id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;