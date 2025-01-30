// src/components/Auth/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = false }) => { // Changed default to false
  const { isAuthenticated } = useAuth();

  // Only protect routes that explicitly require authentication
  if (requireAuth && !isAuthenticated) {
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(currentPath)}`} />;
  }

  return children;
};

export default ProtectedRoute;