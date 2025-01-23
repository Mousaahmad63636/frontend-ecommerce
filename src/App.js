import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

// Context Providers
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { NotificationProvider } from './components/Notification/NotificationProvider';
import { AuthProvider } from './contexts/AuthContext';


// Hooks
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './components/Notification/NotificationProvider';

// Core Components
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import Loading from './components/Loading/Loading';
import Header from './components/Header';
import Footer from './components/Footer';
import ConsultingFloat from './components/ConsultingFloat/ConsultingFloat';

// Lazy-loaded Pages
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

// Context Creation
export const CheckoutStepsContext = React.createContext();

function AppContent() {
  const { showNotification } = useNotification();
  const { isAuthenticated, isAdmin } = useAuth();
  const [currentCheckoutStep, setCurrentCheckoutStep] = React.useState(1);

  // Network status handlers
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

  return (
    <CheckoutStepsContext.Provider value={checkoutStepsValue}>
      <div className="app-wrapper">
        <Header />
        <main className="main-content">
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={isAdmin ? <Navigate to="/admin" replace /> : <Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* Protected Routes */}
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/checkout/delivery" element={<ProtectedRoute><DeliveryPage /></ProtectedRoute>} />
              <Route path="/checkout/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute requireAuth={false}><WishlistPage /></ProtectedRoute>} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  {isAdmin ? <Navigate to="/admin" replace /> : <ProfilePage />}
                </ProtectedRoute>
              } />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminRoute><AdminPage /></AdminRoute>} />

              {/* Redirect Routes */}
              <Route path="/login" element={<Navigate to="/" replace />} />

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
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
  );
}

export default App;