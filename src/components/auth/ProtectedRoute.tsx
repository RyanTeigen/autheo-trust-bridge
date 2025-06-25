
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const { user, profile, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to auth page with the current location
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Creator Access mode - bypass role restrictions in development
  if (import.meta.env.DEV) {
    return <>{children}</>;
  }

  // If specific roles are required, check if user has them
  if (allowedRoles.length > 0 && profile) {
    const hasRequiredRole = allowedRoles.some(role => profile.roles.includes(role));
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
