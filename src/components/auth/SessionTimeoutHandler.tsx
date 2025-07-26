import React from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SessionTimeoutHandler: React.FC = () => {
  const { signOut } = useAuth();
  const { showWarning, timeRemaining, extendSession } = useSessionTimeout();

  if (!showWarning || !timeRemaining) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-900/20">
        <Clock className="h-4 w-4" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">
          Session Expiring Soon
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Your session will expire in {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}.
        </AlertDescription>
        <div className="flex gap-2 mt-3">
          <Button
            onClick={extendSession}
            size="sm"
            variant="outline"
            className="bg-white hover:bg-gray-50 border-amber-300"
          >
            Stay Logged In
          </Button>
          <Button
            onClick={handleSignOut}
            size="sm"
            variant="ghost"
            className="text-amber-800 hover:text-amber-900 hover:bg-amber-100"
          >
            <LogOut className="h-3 w-3 mr-1" />
            Sign Out
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default SessionTimeoutHandler;