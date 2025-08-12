import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SessionTimeoutConfig {
  timeoutDuration: number; // in minutes
  warningDuration: number; // in minutes before timeout to show warning
  checkInterval: number; // in seconds
}

const DEFAULT_CONFIG: SessionTimeoutConfig = {
  timeoutDuration: 10, // 10 minutes
  warningDuration: 5, // 5 minutes warning
  checkInterval: 30 // check every 30 seconds
};

export const useSessionTimeout = (config: Partial<SessionTimeoutConfig> = {}) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningToastRef = useRef<string | null>(null);
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Reset activity tracker
  const resetActivity = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setTimeRemaining(null);
    
    // Dismiss warning toast if active
    if (warningToastRef.current) {
      // Note: react-hot-toast doesn't have a direct dismiss API, 
      // but the warning state will be handled by the next check
      warningToastRef.current = null;
    }
  };

  // Check session status
  const checkSession = () => {
    if (!user) return;

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    const timeoutMs = finalConfig.timeoutDuration * 60 * 1000;
    const warningMs = finalConfig.warningDuration * 60 * 1000;
    
    const remaining = timeoutMs - timeSinceLastActivity;
    
    if (remaining <= 0) {
      // Session timed out
      handleTimeout();
    } else if (remaining <= warningMs && !showWarning) {
      // Show warning
      setShowWarning(true);
      setTimeRemaining(Math.ceil(remaining / 1000 / 60)); // in minutes
      showTimeoutWarning(Math.ceil(remaining / 1000 / 60));
    } else if (remaining > warningMs && showWarning) {
      // Activity detected, hide warning
      resetActivity();
    }
  };

  // Handle session timeout
  const handleTimeout = async () => {
    console.log('Session timeout - automatically signing out user');
    
    try {
      await signOut();
      toast({
        title: 'Session Expired',
        description: 'Your session has expired for security. Please log in again.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error during automatic sign out:', error);
    }
  };

  // Show timeout warning
  const showTimeoutWarning = (minutes: number) => {
    toast({
      title: 'Session Warning',
      description: `Your session will expire in ${minutes} minute${minutes !== 1 ? 's' : ''}. Click anywhere to stay logged in.`,
      variant: 'default',
    });
  };

  // Track user activity
  const handleActivity = () => {
    if (user) {
      resetActivity();
    }
  };

  // Extend session manually
  const extendSession = () => {
    resetActivity();
    toast({
      title: 'Session Extended',
      description: 'Your session has been extended.',
    });
  };

  // Setup activity listeners
  useEffect(() => {
    if (!user) return;

    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add throttling to prevent excessive calls
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledHandleActivity = () => {
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        handleActivity();
        throttleTimeout = null;
      }, 1000); // throttle to once per second
    };

    events.forEach(event => {
      document.addEventListener(event, throttledHandleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity, true);
      });
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [user]);

  // Setup session checking interval
  useEffect(() => {
    if (!user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial activity setup
    resetActivity();

    // Setup interval
    intervalRef.current = setInterval(checkSession, finalConfig.checkInterval * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, finalConfig.checkInterval]);

  return {
    showWarning,
    timeRemaining,
    extendSession,
    resetActivity,
    isActive: !!user
  };
};