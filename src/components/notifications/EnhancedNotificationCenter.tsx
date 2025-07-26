import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Search, Filter, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MedicalTestResultNotification } from './MedicalTestResultNotification';
import { CriticalMedicalUpdateNotification } from './CriticalMedicalUpdateNotification';
import { ProviderCommunicationNotification } from './ProviderCommunicationNotification';
import { SystemNotification } from './SystemNotification';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  created_at: string;
  is_read: boolean;
  data: any;
  expires_at?: string;
}

export const EnhancedNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    setupRealtimeSubscription();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('notification_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'patient_notifications'
        },
        (payload) => {
          setNotifications(prev => [payload.new as NotificationData, ...prev]);
          toast({
            title: "New Notification",
            description: (payload.new as NotificationData).title,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('patient_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('patient_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleViewResults = (testId: string) => {
    // Navigate to test results view
    console.log('Viewing test results:', testId);
    // Implementation would depend on your routing setup
  };

  const handleAcknowledge = async (updateId: string) => {
    // Handle acknowledgment of critical updates
    console.log('Acknowledging update:', updateId);
    // Implementation would update the critical_medical_updates table
  };

  const handleReply = (communicationId: string) => {
    // Navigate to reply interface
    console.log('Replying to communication:', communicationId);
    // Implementation would depend on your messaging system
  };

  const handleViewMessage = (communicationId: string) => {
    // Navigate to full message view
    console.log('Viewing message:', communicationId);
  };

  const handleSystemAction = (actionUrl: string) => {
    // Handle system notification actions
    window.open(actionUrl, '_blank');
  };

  const handleDismissSystemNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      // Remove from local state or mark as dismissed
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error dismissing system notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.notification_type === filterType;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.is_read).length;

  const renderNotification = (notification: NotificationData) => {
    switch (notification.notification_type) {
      case 'medical_test_result':
        return (
          <MedicalTestResultNotification
            key={notification.id}
            notification={{
              ...notification,
              priority: notification.priority as 'normal' | 'high' | 'urgent',
              data: notification.data || {}
            }}
            onMarkAsRead={markAsRead}
            onViewResults={handleViewResults}
          />
        );
      case 'critical_medical_update':
        return (
          <CriticalMedicalUpdateNotification
            key={notification.id}
            notification={{
              ...notification,
              priority: notification.priority as 'normal' | 'high' | 'urgent',
              data: notification.data || {}
            }}
            onMarkAsRead={markAsRead}
            onAcknowledge={handleAcknowledge}
            onViewDetails={handleViewMessage}
          />
        );
      case 'provider_communication':
        return (
          <ProviderCommunicationNotification
            key={notification.id}
            notification={{
              ...notification,
              priority: notification.priority as 'normal' | 'high' | 'urgent',
              data: notification.data || {}
            }}
            onMarkAsRead={markAsRead}
            onReply={handleReply}
            onViewMessage={handleViewMessage}
          />
        );
      case 'system_update':
      case 'security_alert':
        return (
          <SystemNotification
            key={notification.id}
            notification={{
              ...notification,
              data: {
                ...notification.data,
                notification_type: notification.notification_type as 'system_update' | 'security_alert' | 'maintenance' | 'feature_update',
                severity: notification.data?.severity || 'info',
                action_required: notification.data?.action_required || false,
                action_url: notification.data?.action_url,
                action_text: notification.data?.action_text
              }
            }}
            onMarkAsRead={markAsRead}
            onDismiss={handleDismissSystemNotification}
            onTakeAction={handleSystemAction}
          />
        );
      default:
        // Fallback for other notification types
        return (
          <Card key={notification.id} className={`mb-4 ${!notification.is_read ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
              <CardTitle className="text-base">{notification.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
              {!notification.is_read && (
                <Button size="sm" onClick={() => markAsRead(notification.id)}>
                  Mark as Read
                </Button>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
            {urgentCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {urgentCount} Urgent
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} size="sm" variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="medical_test_result">Test Results</SelectItem>
              <SelectItem value="critical_medical_update">Critical Updates</SelectItem>
              <SelectItem value="provider_communication">Messages</SelectItem>
              <SelectItem value="cross_hospital_request">Cross-Hospital</SelectItem>
              <SelectItem value="system_update">System</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map(renderNotification)
          )}
        </div>
      </CardContent>
    </Card>
  );
};