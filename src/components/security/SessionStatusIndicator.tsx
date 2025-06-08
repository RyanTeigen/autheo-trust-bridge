
import React from 'react';
import { Shield, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessionManager } from '@/hooks/useSessionManager';

const SessionStatusIndicator: React.FC = () => {
  try {
    const { 
      sessionInfo, 
      isSessionValid, 
      timeRemaining, 
      isExpiringSoon, 
      refreshSession 
    } = useSessionManager();

    if (!sessionInfo) {
      return null;
    }

    const getStatusColor = () => {
      if (!isSessionValid) return 'destructive';
      if (isExpiringSoon) return 'secondary';
      return 'default';
    };

    const getStatusIcon = () => {
      if (!isSessionValid) return <AlertTriangle className="h-4 w-4" />;
      if (isExpiringSoon) return <Clock className="h-4 w-4" />;
      return <Shield className="h-4 w-4" />;
    };

    const formatTimeRemaining = (minutes: number): string => {
      if (minutes < 60) {
        return `${minutes}m`;
      }
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    };

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <CardTitle className="text-sm text-slate-100">Session Status</CardTitle>
              <Badge variant={getStatusColor() as any} className="text-xs">
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
                  onClick={refreshSession}
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
    console.error('SessionStatusIndicator error:', error);
    return null; // Fail gracefully
  }
};

export default SessionStatusIndicator;
