import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Props for the ProtectedRoute component.
 */
interface ProtectedRouteProps {
  /** The content to render if the user is authenticated */
  children: React.ReactNode;
}

/**
 * ProtectedRoute component to restrict access to authenticated users only.
 * Redirects unauthenticated users to the login page, supporting secure event management (US-11, US-12, US-13).
 * @param props - Component props including the children to render.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show a loading state while checking authentication status
  if (loading) {
    return <div>Loading...</div>;
    // Note: A proper loading spinner component is recommended for better UX (deferred due to time constraints).
  }

  // Redirect to login if the user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;