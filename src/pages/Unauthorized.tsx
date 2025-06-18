
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Home, ArrowLeft, Lock, Stethoscope, Users } from 'lucide-react';
import { useFrontendAuth } from '@/contexts/FrontendAuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useFrontendAuth();

  // In development mode, show Creator Access options
  if (import.meta.env.DEV) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-slate-900">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex p-4 bg-green-500/10 rounded-full">
            <Shield className="h-12 w-12 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-100">Creator Access Mode</h1>
          
          <p className="text-slate-400">
            You are in development mode with full access to all features.
            All pages and portals are accessible regardless of user role.
          </p>
          
          <div className="grid grid-cols-1 gap-3 mt-8">
            <Button
              variant="default"
              onClick={() => navigate('/')}
              className="bg-autheo-primary hover:bg-autheo-primary/80"
            >
              <Home className="mr-2 h-4 w-4" />
              Patient Dashboard
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/provider-portal')}
              className="border-slate-700 hover:bg-slate-800"
            >
              <Stethoscope className="mr-2 h-4 w-4" />
              Provider Portal
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/admin-portal')}
              className="border-slate-700 hover:bg-slate-800"
            >
              <Users className="mr-2 h-4 w-4" />
              Admin Portal
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/compliance')}
              className="border-slate-700 hover:bg-slate-800"
            >
              <Lock className="mr-2 h-4 w-4" />
              Compliance Portal
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/audit-logs')}
              className="border-slate-700 hover:bg-slate-800"
            >
              <Shield className="mr-2 h-4 w-4" />
              Audit Logs
            </Button>
          </div>

          {user && (
            <div className="mt-6 p-4 bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-400">Current User:</p>
              <p className="text-slate-200">{user.username} ({user.role})</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Production unauthorized page
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
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
