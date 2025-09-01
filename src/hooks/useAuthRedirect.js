// src/hooks/useAuthRedirect.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useAuthRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      // If admin is on a non-admin page, redirect to admin dashboard
      if (!window.location.pathname.startsWith('/admin')) {
        navigate('/admin');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return { isAuthenticated, isAdmin: user?.role === 'admin' };
};