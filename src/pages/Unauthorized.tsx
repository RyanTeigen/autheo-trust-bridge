
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Home, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-slate-900">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 bg-amber-500/10 rounded-full">
          <Shield className="h-12 w-12 text-amber-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-100">Creator Access Mode</h1>
        
        <p className="text-slate-400">
          You are viewing the application in Creator Access Mode. 
          All pages should now be accessible to you as the developer/admin.
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
          
          <Button
            variant="outline"
            onClick={() => navigate('/compliance')}
            className="border-slate-700 hover:bg-slate-800"
          >
            <Lock className="mr-2 h-4 w-4" />
            Compliance
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
      </div>
    </div>
  );
};

export default Unauthorized;
