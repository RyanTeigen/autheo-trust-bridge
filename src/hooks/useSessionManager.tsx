
import { useState, useEffect, useCallback } from 'react';
import SessionManager, { SessionInfo } from '@/services/security/SessionManager';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export interface UseSessionManagerReturn {
  sessionInfo: SessionInfo | null;
  isSessionValid: boolean;
  timeRemaining: number;
  isExpiringSoon: boolean;
  refreshSession: () => Promise<boolean>;
  updateActivity: () => void;
  signOut: () => Promise<void>;
}

export const useSessionManager = (): UseSessionManagerReturn => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpiringSoon, setIsExpiringSoon] = useState<boolean>(false);
  const { toast } = useToast();

  const sessionManager = SessionManager.getInstance();

  const updateSessionInfo = useCallback(async () => {
    try {
      const info = await sessionManager.getCurrentSession();
      setSessionInfo(info);
      setIsSessionValid(info?.isValid || false);
      setTimeRemaining(info?.timeRemaining || 0);
      setIsExpiringSoon(info ? info.timeRemaining <= 15 : false);
    } catch (error) {
      console.error('Error updating session info:', error);
      setSessionInfo(null);
      setIsSessionValid(false);
      setTimeRemaining(0);
      setIsExpiringSoon(false);
    }
  }, [sessionManager]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const success = await sessionManager.refreshSession();
      if (success) {
        await updateSessionInfo();
        toast({
          title: "Session Refreshed",
          description: "Your session has been extended.",
        });
      } else {
        toast({
          title: "Session Refresh Failed",
          description: "Please log in again.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast({
        title: "Session Refresh Failed",
        description: "Please log in again.",
        variant: "destructive",
      });
      return false;
    }
  }, [sessionManager, updateSessionInfo, toast]);

  const updateActivity = useCallback(() => {
    try {
      sessionManager.updateLastActivity();
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }, [sessionManager]);

  const signOut = useCallback(async () => {
    try {
      await sessionManager.signOut('manual');
      setSessionInfo(null);
      setIsSessionValid(false);
      setTimeRemaining(0);
      setIsExpiringSoon(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [sessionManager]);

  useEffect(() => {
    // Initial session check
    updateSessionInfo();

    // Set up periodic session monitoring
    const interval = setInterval(updateSessionInfo, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [updateSessionInfo]);

  // Track user activity
  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      updateActivity();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity]);

  return {
    sessionInfo,
    isSessionValid,
    timeRemaining,
    isExpiringSoon,
    refreshSession,
    updateActivity,
    signOut
  };
};
