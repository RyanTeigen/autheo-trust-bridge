
import { useState, useEffect } from 'react';
import { SessionManager, SessionInfo } from '@/services/security/SessionManager';

interface UseSessionManagerReturn {
  sessionInfo: SessionInfo | null;
  isSessionValid: boolean;
  timeRemaining: number;
  isExpiringSoon: boolean;
  refreshSession: () => Promise<void>;
}

export const useSessionManager = (): UseSessionManagerReturn => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpiringSoon, setIsExpiringSoon] = useState<boolean>(false);

  const sessionManager = SessionManager.getInstance();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await sessionManager.getCurrentSession();
        setSessionInfo(session);
        
        if (session) {
          setIsSessionValid(session.isValid);
          setTimeRemaining(session.timeRemaining);
          setIsExpiringSoon(await sessionManager.isSessionExpiringSoon());
        } else {
          setIsSessionValid(false);
          setTimeRemaining(0);
          setIsExpiringSoon(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setSessionInfo(null);
        setIsSessionValid(false);
        setTimeRemaining(0);
        setIsExpiringSoon(false);
      }
    };

    // Check session immediately
    checkSession();

    // Set up interval to check session every minute
    const interval = setInterval(checkSession, 60000);

    // Update last activity on user interaction
    const updateActivity = () => {
      sessionManager.updateLastActivity();
    };

    // Listen for user activity
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);

  const refreshSession = async () => {
    try {
      const success = await sessionManager.refreshSession();
      if (success) {
        const session = await sessionManager.getCurrentSession();
        setSessionInfo(session);
        if (session) {
          setIsSessionValid(session.isValid);
          setTimeRemaining(session.timeRemaining);
          setIsExpiringSoon(await sessionManager.isSessionExpiringSoon());
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  return {
    sessionInfo,
    isSessionValid,
    timeRemaining,
    isExpiringSoon,
    refreshSession
  };
};
