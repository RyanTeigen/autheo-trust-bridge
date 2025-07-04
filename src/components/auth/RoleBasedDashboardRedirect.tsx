
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingStates from '../ux/LoadingStates';

const RoleBasedDashboardRedirect: React.FC = () => {
  const { profile, isLoading } = useAuth();

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900 text-slate-100">
        <LoadingStates type="security" message="Loading your dashboard..." size="lg" />
      </div>
    );
  }

  // Determine redirect based on user role
  const userRole = profile?.role || 'patient';
  
  // Priority order: admin/supervisor > provider > patient
  if (userRole === 'admin' || userRole === 'supervisor') {
    return <Navigate to="/admin-portal" replace />;
  }
  
  if (userRole === 'provider') {
    return <Navigate to="/provider-portal" replace />;
  }
  
  // Default to patient dashboard
  return <Navigate to="/patient-dashboard" replace />;
};

export default RoleBasedDashboardRedirect;
