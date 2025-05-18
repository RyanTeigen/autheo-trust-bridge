
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Home, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-slate-900">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 bg-red-500/10 rounded-full">
          <Shield className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-100">Access Denied</h1>
        
        <p className="text-slate-400">
          You don't have the necessary permissions to access this page. Please contact an administrator or switch to a different role.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
