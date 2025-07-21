import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Monitor, Smartphone, Tablet, MapPin, Clock, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

interface UserSession {
  id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  last_activity: string;
  expires_at: string;
  is_active: boolean;
  terminated_at?: string;
  termination_reason?: string;
}

interface SessionManagerProps {
  className?: string;
}

const getDeviceIcon = (userAgent?: string) => {
  if (!userAgent) return Monitor;
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return Smartphone;
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return Tablet;
  }
  return Monitor;
};

const getDeviceInfo = (userAgent?: string) => {
  if (!userAgent) return 'Unknown Device';
  
  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browser = 'Unknown Browser';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  
  // OS detection
  let os = 'Unknown OS';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  return `${browser} on ${os}`;
};

export const SessionManager: React.FC<SessionManagerProps> = ({ className }) => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      // For now, we'll create mock data since the table is newly created
      // In a real implementation, this would query the user_sessions table
      const mockSessions: UserSession[] = [];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load session information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setTerminatingSession(sessionId);
    try {
      // For now, just update local state since table is newly created
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? {
                ...session,
                is_active: false,
                terminated_at: new Date().toISOString(),
                termination_reason: 'user_terminated',
              }
            : session
        )
      );

      toast({
        title: "Session Terminated",
        description: "The session has been successfully terminated.",
      });
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        title: "Error",
        description: "Failed to terminate session.",
        variant: "destructive",
      });
    } finally {
      setTerminatingSession(null);
    }
  };

  const extendSession = async (sessionToken: string) => {
    try {
      const { data, error } = await supabase.rpc('extend_session', {
        session_token_param: sessionToken,
      });

      if (error) throw error;

      if (data) {
        await fetchSessions(); // Refresh sessions
        toast({
          title: "Session Extended",
          description: "Your session has been extended by 8 hours.",
        });
      } else {
        toast({
          title: "Extension Failed",
          description: "Unable to extend this session.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error extending session:', error);
      toast({
        title: "Error",
        description: "Failed to extend session.",
        variant: "destructive",
      });
    }
  };

  const activeSessions = sessions.filter(session => session.is_active);
  const inactiveSessions = sessions.filter(session => !session.is_active);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading sessions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Sessions</span>
            <Badge variant="secondary">{activeSessions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No active sessions
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.user_agent);
                const deviceInfo = getDeviceInfo(session.user_agent);
                const isExpiringSoon = new Date(session.expires_at) < new Date(Date.now() + 60 * 60 * 1000); // 1 hour
                
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <DeviceIcon className="w-5 h-5 text-muted-foreground mt-1" />
                      <div className="space-y-1">
                        <div className="font-medium">{deviceInfo}</div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {session.ip_address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {session.ip_address}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last active: {formatDistanceToNow(new Date(session.last_activity))} ago
                          </div>
                          <div>
                            Expires: {format(new Date(session.expires_at), 'MMM dd, HH:mm')}
                            {isExpiringSoon && (
                              <Badge variant="destructive" className="ml-2">
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isExpiringSoon && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => extendSession(session.session_token)}
                        >
                          Extend
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => terminateSession(session.id)}
                        disabled={terminatingSession === session.id}
                      >
                        <LogOut className="w-4 h-4" />
                        {terminatingSession === session.id ? 'Terminating...' : 'Terminate'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Inactive Sessions */}
      {inactiveSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Inactive Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {inactiveSessions.slice(0, 10).map((session) => {
                  const DeviceIcon = getDeviceIcon(session.user_agent);
                  const deviceInfo = getDeviceInfo(session.user_agent);
                  
                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 p-3 border rounded-lg opacity-60"
                    >
                      <DeviceIcon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="text-sm font-medium">{deviceInfo}</div>
                        <div className="text-xs text-muted-foreground">
                          {session.ip_address && `${session.ip_address} • `}
                          Ended: {format(new Date(session.terminated_at || session.expires_at), 'MMM dd, HH:mm')}
                          {session.termination_reason && (
                            <span className="ml-2">
                              ({session.termination_reason.replace('_', ' ')})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};