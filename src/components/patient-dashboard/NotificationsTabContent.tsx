
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  RefreshCw,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';

interface PatientNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  expires_at: string | null;
  priority: string;
}

const NotificationsTabContent: React.FC = () => {
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // First get patient record to get patient_id
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError || !patient) {
        console.error('Error fetching patient record:', patientError);
        return;
      }

      // Fetch notifications for this patient
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('patient_notifications')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
        toast({
          title: "Error Loading Notifications",
          description: "Unable to load your notifications",
          variant: "destructive",
        });
        return;
      }

      setNotifications(notificationsData || []);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription for new notifications
    if (user) {
      const channel = supabase
        .channel('notifications_tab_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'patient_notifications'
          },
          (payload) => {
            console.log('New notification received:', payload);
            fetchNotifications(); // Refresh notifications
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('patient_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) return;

      const { error } = await supabase
        .from('patient_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('patient_id', patient.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return;
      }

      fetchNotifications();
      toast({
        title: "All notifications marked as read",
        description: "Your notifications have been updated",
      });
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'urgent') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    
    switch (type) {
      case 'access_request':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'appointment_access_request':
        return priority === 'urgent' ? 
          <AlertTriangle className="h-5 w-5 text-red-500" /> : 
          <Calendar className="h-5 w-5 text-blue-500" />;
      case 'access_granted':
      case 'access_auto_approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'access_revoked':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'access_expired':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'normal': return 'border-blue-500 bg-blue-500/10';
      case 'low': return 'border-slate-500 bg-slate-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  const handleNotificationClick = (notification: PatientNotification) => {
    // Handle appointment-related notifications
    if (notification.notification_type === 'appointment_access_request' || 
        notification.notification_type === 'access_auto_approved') {
      const appointmentId = notification.data?.appointment_id;
      if (appointmentId) {
        setSelectedAppointmentId(appointmentId);
        setAppointmentModalOpen(true);
        // Mark as read when clicked
        if (!notification.is_read) {
          markAsRead(notification.id);
        }
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.is_read).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Loading Notifications...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-slate-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Notifications & Alerts</h2>
          <p className="text-slate-400">
            Manage access requests, appointment notifications, and important updates
          </p>
          <div className="flex items-center gap-4 mt-2">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-blue-600 text-white">
                {unreadCount} unread
              </Badge>
            )}
            {urgentCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {urgentCount} urgent
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button
            onClick={fetchNotifications}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
              <p className="text-sm">
                You'll receive notifications about access requests, appointments, and important updates here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 transition-all ${
                    notification.is_read 
                      ? 'bg-slate-800/50' 
                      : `${getPriorityColor(notification.priority)} bg-opacity-20`
                  } ${
                    (notification.notification_type === 'appointment_access_request' || 
                     notification.notification_type === 'access_auto_approved') ? 
                    'cursor-pointer hover:bg-slate-700/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getNotificationIcon(notification.notification_type, notification.priority)}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-200">
                            {notification.title}
                          </h4>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={
                                notification.priority === 'urgent' 
                                  ? 'border-red-500 text-red-300 bg-red-500/10' 
                                  : notification.priority === 'high'
                                  ? 'border-orange-500 text-orange-300 bg-orange-500/10'
                                  : 'border-slate-500 text-slate-300'
                              }
                            >
                              {notification.priority}
                            </Badge>
                            
                            {(notification.notification_type === 'appointment_access_request' || 
                              notification.notification_type === 'access_auto_approved') && (
                              <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                                Click to view
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-slate-300 leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </div>
                          {notification.expires_at && (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Expires: {new Date(notification.expires_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!notification.is_read && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:bg-slate-600 ml-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Modal */}
      {selectedAppointmentId && (
        <AppointmentDetailsModal
          open={appointmentModalOpen}
          onOpenChange={setAppointmentModalOpen}
          appointmentId={selectedAppointmentId}
          onAccessDecision={fetchNotifications}
        />
      )}
    </div>
  );
};

export default NotificationsTabContent;
