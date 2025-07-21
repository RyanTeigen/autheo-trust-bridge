import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Shield, Clock, User, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  event_data: any;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

interface SecurityEventMonitorProps {
  className?: string;
}

const severityConfig = {
  low: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: Shield,
  },
  medium: {
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    icon: AlertTriangle,
  },
  high: {
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-700 dark:text-orange-300',
    icon: AlertTriangle,
  },
  critical: {
    color: 'bg-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-700 dark:text-red-300',
    icon: AlertTriangle,
  },
};

export const SecurityEventMonitor: React.FC<SecurityEventMonitorProps> = ({ className }) => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      // For now, we'll create mock data since the table is newly created
      // In a real implementation, this would query the security_events table
      const mockEvents: SecurityEvent[] = [];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching security events:', error);
      toast({
        title: "Error",
        description: "Failed to load security events.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveEvent = async (eventId: string) => {
    try {
      // For now, just update local state since table is newly created
      setEvents(prev =>
        prev.map(event =>
          event.id === eventId
            ? { ...event, resolved: true, resolved_at: new Date().toISOString() }
            : event
        )
      );

      toast({
        title: "Event Resolved",
        description: "Security event has been marked as resolved.",
      });
    } catch (error) {
      console.error('Error resolving event:', error);
      toast({
        title: "Error",
        description: "Failed to resolve security event.",
        variant: "destructive",
      });
    }
  };

  const unresolvedCount = events.filter(event => !event.resolved).length;
  const criticalCount = events.filter(event => event.severity === 'critical' && !event.resolved).length;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading security events...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Events
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} Critical</Badge>
            )}
            <Badge variant="secondary">{unresolvedCount} Unresolved</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No security events recorded
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const config = severityConfig[event.severity];
                const Icon = config.icon;
                
                return (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${config.bgColor} ${
                      event.resolved ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${config.color}`} />
                          <Icon className={`w-4 h-4 ${config.textColor}`} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.event_type}</span>
                            <Badge variant={event.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {event.severity}
                            </Badge>
                            {event.resolved && (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(event.created_at), 'MMM dd, HH:mm')}
                              </div>
                              {event.user_id && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  User ID: {event.user_id.slice(0, 8)}...
                                </div>
                              )}
                            </div>
                            {event.ip_address && (
                              <div>IP: {event.ip_address}</div>
                            )}
                            {event.event_data && Object.keys(event.event_data).length > 0 && (
                              <div className="text-xs font-mono bg-background/50 p-2 rounded">
                                {JSON.stringify(event.event_data, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {!event.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveEvent(event.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};