import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component for guarding private pages.
 * Redirects to /login if no valid session token exists.
 */
export const ProtectedRoute = () => {
  const { token, isLoading } = useAuth();

  // Render loading state while session restoration is pending
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Render matching child route
  return <Outlet />;
};

export default ProtectedRoute;
