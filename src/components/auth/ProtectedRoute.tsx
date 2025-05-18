
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
    // Redirect to login page and remember where they were trying to go
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // If roles are required, check if the user has at least one of them
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      // Redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If authenticated and has required roles, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
