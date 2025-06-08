
import React from 'react';
import { Shield, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessionManager } from '@/hooks/useSessionManager';
import LoadingStates from '../ux/LoadingStates';

const SessionStatusIndicator: React.FC = () => {
  try {
    const { 
      sessionInfo, 
      isSessionValid, 
      timeRemaining, 
      isExpiringSoon, 
      refreshSession 
    } = useSessionManager();

    // Don't render if no session info
    if (!sessionInfo) {
      return null;
    }

    const getStatusColor = (): 'destructive' | 'secondary' | 'default' => {
      if (!isSessionValid) return 'destructive';
      if (isExpiringSoon) return 'secondary';
      return 'default';
    };

    const getStatusIcon = () => {
      const iconClass = "h-4 w-4";
      if (!isSessionValid) return <AlertTriangle className={iconClass} />;
      if (isExpiringSoon) return <Clock className={iconClass} />;
      return <Shield className={iconClass} />;
    };

    const formatTimeRemaining = (minutes: number): string => {
      if (minutes < 60) {
        return `${minutes}m`;
      }
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    };

    const handleRefreshSession = async () => {
      try {
        await refreshSession();
      } catch (error) {
        // Error handling is done in the hook
      }
    };

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm max-w-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <CardTitle className="text-sm text-slate-100">Session Status</CardTitle>
              <Badge variant={getStatusColor()} className="text-xs">
                {isSessionValid ? 'Active' : 'Expired'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2">
              <div className="text-xs text-slate-400">
                {isSessionValid ? (
                  <>
                    Time remaining: {formatTimeRemaining(timeRemaining)}
                    {isExpiringSoon && (
                      <div className="text-orange-400 mt-1">
                        Session expiring soon!
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-red-400">Session has expired</div>
                )}
              </div>
              
              {isExpiringSoon && (
                <Button 
                  size="sm" 
                  onClick={handleRefreshSession}
                  className="w-full bg-autheo-primary hover:bg-autheo-primary/90"
                >
                  Extend Session
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    // Fail gracefully - don't log in production
    return null;
  }
};

export default SessionStatusIndicator;
