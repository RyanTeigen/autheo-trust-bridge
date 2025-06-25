
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
  showUnauthorizedMessage?: boolean;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles = [],
  redirectTo,
  showUnauthorizedMessage = true
}) => {
  const { user, profile, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Creator Access mode - bypass role restrictions in development
  if (import.meta.env.DEV) {
    return <>{children}</>;
  }

  // If no specific roles are required, allow access
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has required role
  const userRoles = profile?.roles || ['patient'];
  const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
  
  if (!hasRequiredRole) {
    // If a custom redirect is specified, use it
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Show unauthorized message or redirect to unauthorized page
    if (showUnauthorizedMessage) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
          <div className="max-w-md w-full">
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-slate-200">
                You don't have permission to access this page. 
                Required roles: {allowedRoles.join(', ')}
                <br />
                Your current roles: {userRoles.join(', ')}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
