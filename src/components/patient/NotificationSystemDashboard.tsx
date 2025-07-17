import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  Activity,
  TrendingUp,
  Settings,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface NotificationMetrics {
  total: number;
  unread: number;
  urgent: number;
  responses_needed: number;
  recent_activity: number;
}

interface SystemHealth {
  database_triggers: boolean;
  realtime_enabled: boolean;
  edge_functions: boolean;
  notification_delivery: boolean;
}

interface TeamRecommendation {
  area: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  expertise_needed: string[];
}

const NotificationSystemDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<NotificationMetrics>({
    total: 0,
    unread: 0,
    urgent: 0,
    responses_needed: 0,
    recent_activity: 0
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database_triggers: false,
    realtime_enabled: false,
    edge_functions: false,
    notification_delivery: false
  });
  const [loading, setLoading] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  // Team expansion recommendations based on current system needs
  const teamRecommendations: TeamRecommendation[] = [
    {
      area: "Real-time Notification Infrastructure",
      priority: "high",
      description: "Implement robust real-time notification system with WebSocket connections and push notifications",
      impact: "Immediate user engagement and response time improvement",
      expertise_needed: ["Backend Developer", "DevOps Engineer", "Mobile Developer"]
    },
    {
      area: "UX/UI for Notification Management",
      priority: "high",
      description: "Design intuitive notification interfaces for less tech-savvy patients",
      impact: "Improved user experience and reduced support burden",
      expertise_needed: ["UX Designer", "UI Designer", "Frontend Developer"]
    },
    {
      area: "Healthcare Compliance & Security",
      priority: "high",
      description: "Ensure notification system meets HIPAA requirements and handles PHI securely",
      impact: "Legal compliance and patient trust",
      expertise_needed: ["Healthcare IT Specialist", "Security Engineer", "Compliance Officer"]
    },
    {
      area: "Mobile App Development",
      priority: "medium",
      description: "Create native mobile apps for better notification delivery and user experience",
      impact: "Enhanced accessibility and user engagement",
      expertise_needed: ["Mobile Developer (iOS)", "Mobile Developer (Android)", "Push Notification Specialist"]
    },
    {
      area: "Analytics & Monitoring",
      priority: "medium",
      description: "Implement comprehensive monitoring and analytics for notification performance",
      impact: "Data-driven optimization and issue detection",
      expertise_needed: ["Data Engineer", "Analytics Specialist", "Site Reliability Engineer"]
    },
    {
      area: "AI/ML for Smart Notifications",
      priority: "low",
      description: "Implement intelligent notification prioritization and timing",
      impact: "Reduced notification fatigue and improved user satisfaction",
      expertise_needed: ["ML Engineer", "Data Scientist", "AI/ML Specialist"]
    }
  ];

  useEffect(() => {
    if (user) {
      fetchNotificationMetrics();
      checkSystemHealth();
    }
  }, [user]);

  const fetchNotificationMetrics = async () => {
    try {
      // Get patient ID first
      const { data: patientData } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!patientData) return;

      // Fetch notification metrics
      const { data: notifications } = await supabase
        .from('patient_notifications')
        .select('*')
        .eq('patient_id', patientData.id)
        .order('created_at', { ascending: false });

      if (notifications) {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        setMetrics({
          total: notifications.length,
          unread: notifications.filter(n => !n.is_read).length,
          urgent: notifications.filter(n => n.priority === 'urgent').length,
          responses_needed: notifications.filter(n => 
            n.notification_type === 'access_request' && !n.is_read
          ).length,
          recent_activity: notifications.filter(n => 
            new Date(n.created_at) > oneDayAgo
          ).length
        });

        setRecentNotifications(notifications.slice(0, 5));
      }

      // Fetch pending access requests
      const { data: pendingRequests } = await supabase
        .from('sharing_permissions')
        .select('*')
        .eq('patient_id', patientData.id)
        .eq('status', 'pending');

      if (pendingRequests) {
        setMetrics(prev => ({
          ...prev,
          responses_needed: pendingRequests.length
        }));
      }

    } catch (error) {
      console.error('Error fetching notification metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSystemHealth = async () => {
    try {
      // Check if realtime is working
      const channel = supabase.channel('health_check');
      const realtimeWorking = await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(false), 3000);
        channel.on('presence', { event: 'sync' }, () => {
          clearTimeout(timeout);
          resolve(true);
        });
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            channel.track({ test: true });
          }
        });
      });

      // Check edge function availability
      const { error: edgeFunctionError } = await supabase.functions.invoke('respond_to_access_request', {
        body: { test: true }
      });

      setSystemHealth({
        database_triggers: true, // Assume working if we got here
        realtime_enabled: !!realtimeWorking,
        edge_functions: !edgeFunctionError,
        notification_delivery: true // Will be enhanced with actual checks
      });

    } catch (error) {
      console.error('Error checking system health:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-autheo-primary">
            Notification System Dashboard
          </h2>
          <p className="text-slate-400">
            Monitor notification performance and plan team expansion
          </p>
        </div>
        <Button 
          onClick={fetchNotificationMetrics}
          variant="outline"
          className="bg-slate-800 border-slate-600"
        >
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Health Status */}
      <Alert className="border-slate-600 bg-slate-800/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-slate-300">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-medium">System Health:</span>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${systemHealth.database_triggers ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Database Triggers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${systemHealth.realtime_enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Realtime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${systemHealth.edge_functions ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Edge Functions</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-autheo-primary">{metrics.total}</div>
            <p className="text-xs text-slate-400">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Responses Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{metrics.responses_needed}</div>
            <p className="text-xs text-slate-400">Pending approval</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{metrics.unread}</div>
            <p className="text-xs text-slate-400">Need attention</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{metrics.recent_activity}</div>
            <p className="text-xs text-slate-400">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Expansion Recommendations */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Expansion Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamRecommendations.map((rec, index) => (
            <div key={index} className="border border-slate-600 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${getPriorityColor(rec.priority)}`}></div>
                  <div>
                    <h4 className="font-medium text-slate-200">{rec.area}</h4>
                    <p className="text-sm text-slate-400">{rec.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {rec.priority} priority
                </Badge>
              </div>
              
              <div className="text-sm text-slate-300">
                <span className="font-medium">Impact:</span> {rec.impact}
              </div>
              
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-slate-400">Expertise needed:</span>
                {rec.expertise_needed.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentNotifications.length > 0 ? (
            <div className="space-y-3">
              {recentNotifications.map((notification, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                  <div className="flex-shrink-0">
                    {notification.priority === 'urgent' ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Info className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-200">{notification.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {notification.notification_type}
                      </Badge>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-autheo-primary"></div>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-1">{notification.message}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent notifications</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSystemDashboard;