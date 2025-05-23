
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-slate-400">Verifying authentication...</div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Store the current location they were trying to access
    // so we can redirect them back after logging in
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // If specific roles are required, check if user has at least one of them
  // This is only used for UI organization but not for security
  // since we're using creator access mode
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      // For UI organization only - in reality always return children
      // since we're using creator access mode
      console.log('User does not have required role, but allowing access in creator mode');
    }
  }

  // Grant access
  return <>{children}</>;
};

export default ProtectedRoute;
