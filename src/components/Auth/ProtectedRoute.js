import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated } = useAuth();

  // If authentication is not required, render children
  if (!requireAuth) {
    return children;
  }

  // If authentication is required but user is not authenticated,
  // redirect to login with return URL
  if (requireAuth && !isAuthenticated) {
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(currentPath)}`} />;
  }

  // User is authenticated, render children
  return children;
};

export default ProtectedRoute;