
import React from 'react';
import { Shield, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessionManager } from '@/hooks/useSessionManager';
import LoadingStates from '../ux/LoadingStates';

const SessionStatusIndicator: React.FC = () => {
  // Keep the session management logic running in the background
  // but don't render any UI
  const { 
    sessionInfo, 
    isSessionValid, 
    timeRemaining, 
    isExpiringSoon, 
    refreshSession 
  } = useSessionManager();

  // Return null to hide the UI while keeping the timer active
  return null;
};

export default SessionStatusIndicator;
