// src/components/Auth/ProtectedRoute.js
function ProtectedRoute({ children, requireAuth = true }) {
    const { isAuthenticated, loading, initialized } = useAuth();
    const location = useLocation();

    // Show loading while checking auth status
    if (!initialized || loading) {
        return <Loading />;
    }

    // If authentication is not required, render children
    if (!requireAuth) {
        return children;
    }

    // If authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}