
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Home, ArrowLeft, Lock, Stethoscope, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Removed development creator access mode for production security

  // Production unauthorized page
  const userRole = profile?.role || 'patient';
  
  // Determine user's default dashboard
  const getDefaultDashboard = () => {
    if (userRole === 'admin' || userRole === 'supervisor') {
      return '/admin-portal';
    }
    
    if (userRole === 'provider') {
      return '/provider-portal';
    }
    return '/patient-dashboard';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-slate-900">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 bg-amber-500/10 rounded-full">
          <Shield className="h-12 w-12 text-amber-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-100">Access Denied</h1>
        
        <p className="text-slate-400">
          You don't have permission to access this resource.
          Please contact your administrator if you believe this is an error.
        </p>

        {profile && (
          <div className="bg-slate-800 rounded-lg p-4 text-left">
            <p className="text-sm text-slate-400 mb-2">Your current role:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-200">
                {userRole}
              </span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-slate-700 hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          
          <Button
            variant="default"
            onClick={() => navigate(getDefaultDashboard())}
          >
            <Home className="mr-2 h-4 w-4" />
            My Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
