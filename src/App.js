import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
//import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

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
import Loading from './components/Loading/Loading';
import Header from './components/Header';
import Footer from './components/Footer';
import ConsultingFloat from './components/ConsultingFloat/ConsultingFloat';

// Lazy loaded pages
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

export const CheckoutStepsContext = React.createContext();

function AppContent() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isAuthenticated, isAdmin, initialized } = useAuth();
  const [currentCheckoutStep, setCurrentCheckoutStep] = React.useState(1);

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
    return <Loading />;
  }

  return (
    <CheckoutStepsContext.Provider value={checkoutStepsValue}>
      <div className="app-wrapper">
        <Header />
        <main className="main-content">
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public Routes - No Authentication Required */}
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/category/:categoryName" element={<Home />} />
              <Route path="/search" element={<Home />} />
              <Route path="/wishlist" element={<WishlistPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={
                isAuthenticated ? 
                <Navigate to="/" replace /> : 
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
              } />
              <Route path="/register" element={
                isAuthenticated ? 
                <Navigate to="/" replace /> : 
                <LoginModal 
                  onClose={() => navigate('/')}
                  onSuccess={() => navigate('/')}
                  initialMode="register"
                />
              } />

              {/* Protected Routes - Require Authentication */}
              <Route path="/checkout" element={
                <ProtectedRoute requireAuth={true}>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="/checkout/delivery" element={
                <ProtectedRoute requireAuth={true}>
                  <DeliveryPage />
                </ProtectedRoute>
              } />
              <Route path="/checkout/payment" element={
                <ProtectedRoute requireAuth={true}>
                  <PaymentPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute requireAuth={true}>
                  {isAdmin ? <Navigate to="/admin" replace /> : <ProfilePage />}
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute requireAuth={true}>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/order-confirmation/:orderId" element={
                <ProtectedRoute requireAuth={true}>
                  <OrderConfirmationPage />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={
                <div className="container mt-5 text-center">
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </button>
                </div>
              } />
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
  );
}

export default App;