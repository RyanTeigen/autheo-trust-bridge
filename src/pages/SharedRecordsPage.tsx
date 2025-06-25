
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SharedRecordsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to patient dashboard with shared records tab
    const timer = setTimeout(() => {
      navigate('/patient-dashboard', { replace: true });
      // Note: We can't directly set the tab state from here, but users can navigate to it
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-4">
        <Shield className="h-12 w-12 mx-auto text-autheo-primary" />
        <h1 className="text-2xl font-bold text-autheo-primary">Shared Records</h1>
        
        <Alert className="bg-slate-800 border-slate-700">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-slate-300">
            Shared Records functionality has been moved to your Patient Dashboard. 
            You'll be redirected shortly, or you can navigate there manually.
          </AlertDescription>
        </Alert>
        
        <p className="text-slate-400 text-sm">
          Redirecting to Patient Dashboard in 3 seconds...
        </p>
      </div>
    </div>
  );
};

export default SharedRecordsPage;
