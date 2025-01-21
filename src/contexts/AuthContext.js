// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useNotification } from '../components/Notification/NotificationProvider';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const checkAuthStatus = useCallback(async () => {
        if (initialized) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (token) {
                const response = await api.getUserProfile();
                if (response?.user) {
                    setUser(response.user);
                } else {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [initialized]);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await api.login({ email, password });

            if (response?.user) {
                if (response.token) {
                    localStorage.setItem('token', response.token);
                }
                setUser(response.user);
                showNotification(`Welcome back, ${response.user.name}!`, 'success');
                return response.user;
            }
            throw new Error('Invalid response from server');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            showNotification(errorMessage, 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await api.register(userData);

            if (response?.user) {
                if (response.token) {
                    localStorage.setItem('token', response.token);
                }
                setUser(response.user);
                showNotification('Account created successfully!', 'success');
                navigate('/profile');
                return response.user;
            }
            throw new Error('Invalid response from server');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            showNotification(errorMessage, 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = useCallback(async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            showNotification('Logged out successfully', 'success');
            navigate('/');
        }
    }, [navigate, showNotification]);

    const updateProfile = async (userData) => {
        try {
            setLoading(true);
            const response = await api.updateProfile(userData);
            if (response?.user) {
                setUser(response.user);
                showNotification('Profile updated successfully', 'success');
                return response.user;
            }
            throw new Error('Failed to update profile');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
            showNotification(errorMessage, 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async (currentPassword, newPassword) => {
        try {
            setLoading(true);
            await api.updatePassword(currentPassword, newPassword);
            showNotification('Password updated successfully', 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Password update failed';
            showNotification(errorMessage, 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteAccount = async () => {
        try {
            setLoading(true);
            await api.deleteAccount();
            localStorage.removeItem('token');
            setUser(null);
            showNotification('Account deleted successfully', 'success');
            navigate('/');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete account';
            showNotification(errorMessage, 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const contextValue = useMemo(() => ({
        user,
        loading,
        initialized,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        logout,
        register,
        updateProfile,
        updatePassword,
        deleteAccount,
        refreshUser: checkAuthStatus
    }), [user, loading, initialized, logout, checkAuthStatus]);

    if (!initialized && loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;