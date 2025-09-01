// src/App.js
import React, { useEffect, Suspense, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';
import { Helmet, HelmetProvider } from 'react-helmet-async';

// Contexts
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { NotificationProvider } from './components/Notification/NotificationProvider';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './components/Notification/NotificationProvider';

// Components
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import ConsultingFloat from './components/ConsultingFloat/ConsultingFloat';

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}

// Lazy loaded pages with modern suspense boundaries
const Home = React.lazy(() => import('./pages/Home'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
const OrderConfirmationPage = React.lazy(() => import('./pages/OrderConfirmationPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const DeliveryPage = React.lazy(() => import('./pages/DeliveryPage'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));
const LoginModal = React.lazy(() => import('./components/Auth/LoginModal'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));

export const CheckoutStepsContext = React.createContext();

function AppContent() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isAuthenticated, isAdmin, initialized } = useAuth();
  const [currentCheckoutStep, setCurrentCheckoutStep] = React.useState(1);

  // Second useEffect for online/offline notifications
  useEffect(() => {
    const handleOnline = () => showNotification('Back online', 'success');
    const handleOffline = () => showNotification('No internet connection', 'error');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showNotification]);

  const checkoutStepsValue = {
    currentStep: currentCheckoutStep,
    setCurrentStep: setCurrentCheckoutStep,
    steps: {
      CART: 1,
      CHECKOUT: 2,
      DELIVERY: 3
    }
  };

  if (!initialized) {
    return <LoadingSpinner />;
  }

  return (
    <CheckoutStepsContext.Provider value={checkoutStepsValue}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/category/:categoryName" element={<Home />} />
              <Route path="/search" element={<Home />} />
              <Route path="/wishlist" element={<WishlistPage />} />

              {/* Auth Routes */}
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <LoginModal
                      onClose={() => {
                        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
                        navigate(returnUrl || '/');
                      }}
                      onSuccess={() => {
                        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
                        navigate(returnUrl || '/');
                      }}
                      initialMode="login"
                    />
                  )
                }
              />

              <Route
                path="/register"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <LoginModal
                      onClose={() => navigate('/')}
                      onSuccess={() => navigate('/')}
                      initialMode="register"
                    />
                  )
                }
              />

              {/* Checkout Routes */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/delivery" element={<DeliveryPage />} />
              <Route path="/checkout/payment" element={<PaymentPage />} />

              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requireAuth={true}>
                    {isAdmin ? <Navigate to="/admin" replace /> : <ProfilePage />}
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                    <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                    <button
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                        transition-colors duration-200"
                      onClick={() => window.history.back()}
                    >
                      Go Back
                    </button>
                  </div>
                }
              />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <ConsultingFloat />
      </div>
    </CheckoutStepsContext.Provider>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ErrorBoundary>
          <NotificationProvider>
            <AuthProvider>
              <WishlistProvider>
                <CartProvider>
                  <ScrollToTop />
                  <AppContent />
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </NotificationProvider>
        </ErrorBoundary>
      </Router>
    </HelmetProvider>
  );
}

export default App;