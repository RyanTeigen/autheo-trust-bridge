
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useRoleBasedRouting = () => {
  const { profile, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getDefaultRouteForRole = (roles: string[]): string => {
    // Priority order: admin/supervisor > provider > patient
    if (roles.includes('admin') || roles.includes('supervisor')) {
      return '/admin-portal';
    }
    if (roles.includes('provider')) {
      return '/provider-portal';
    }
    // Default to patient dashboard
    return '/';
  };

  const redirectToRoleBasedDashboard = () => {
    if (!isAuthenticated || !profile || isLoading) return;

    const userRoles = profile.roles || ['patient'];
    const defaultRoute = getDefaultRouteForRole(userRoles);
    
    // Only redirect if user is on root path or auth page
    if (location.pathname === '/' || location.pathname === '/auth') {
      navigate(defaultRoute, { replace: true });
    }
  };

  const hasRequiredRole = (allowedRoles: string[]): boolean => {
    if (!profile || !profile.roles) return false;
    return allowedRoles.some(role => profile.roles.includes(role));
  };

  const canAccessRoute = (requiredRoles?: string[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return hasRequiredRole(requiredRoles);
  };

  return {
    redirectToRoleBasedDashboard,
    hasRequiredRole,
    canAccessRoute,
    userRoles: profile?.roles || ['patient'],
    isLoading,
    isAuthenticated
  };
};
