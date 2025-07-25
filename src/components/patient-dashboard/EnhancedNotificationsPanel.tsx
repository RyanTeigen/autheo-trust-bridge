import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  RefreshCw,
  Clock,
  Eye,
  X,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle
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

const EnhancedNotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
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
        .limit(20);

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
        .channel('patient_notifications_changes')
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'access_auto_approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'access_revoked':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'access_expired':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'normal': return 'border-blue-500 bg-blue-500/10';
      case 'low': return 'border-gray-500 bg-gray-500/10';
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

  if (isLoading) {
    return (
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
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-autheo-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-slate-400">
            Access requests, updates, and important information about your medical records
          </CardDescription>
        </div>
        <Button
          onClick={fetchNotifications}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">You'll receive notifications about access requests and updates here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all ${
                  notification.is_read 
                    ? 'bg-slate-700 border-slate-600' 
                    : `${getPriorityColor(notification.priority)} border-2`
                } ${
                  (notification.notification_type === 'appointment_access_request' || 
                   notification.notification_type === 'access_auto_approved') ? 
                  'cursor-pointer hover:bg-slate-600' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.notification_type, notification.priority)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-200">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <BellRing className="h-4 w-4 text-autheo-primary" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {notification.priority}
                        </Badge>
                        {(notification.notification_type === 'appointment_access_request' || 
                          notification.notification_type === 'access_auto_approved') && (
                          <Badge variant="secondary" className="text-xs">
                            Click to view
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span>
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        {notification.expires_at && (
                          <span>
                            Expires: {new Date(notification.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {notification.data && Object.keys(notification.data).length > 0 && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedNotification(
                            expandedNotification === notification.id ? null : notification.id
                          );
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:bg-slate-600"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    {!notification.is_read && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:bg-slate-600"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {expandedNotification === notification.id && notification.data && (
                  <div className="mt-3 p-3 bg-slate-600 rounded border border-slate-500">
                    <h5 className="text-slate-200 font-medium mb-2">Additional Details:</h5>
                    
                    {/* Show appointment-specific data in a user-friendly format */}
                    {(notification.notification_type === 'appointment_access_request' || 
                      notification.notification_type === 'access_auto_approved') && 
                      notification.data.required_data_types && (
                      <div className="space-y-3">
                        <div>
                          <h6 className="text-sm font-medium text-slate-300 mb-2">Required Medical Data:</h6>
                          <div className="flex flex-wrap gap-2">
                            {notification.data.required_data_types.map((dataType: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {dataType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {notification.data.access_justification && (
                          <div>
                            <h6 className="text-sm font-medium text-slate-300 mb-1">Access Justification:</h6>
                            <p className="text-xs text-slate-400">{notification.data.access_justification}</p>
                          </div>
                        )}
                        
                        {notification.data.appointment_date && (
                          <div>
                            <h6 className="text-sm font-medium text-slate-300 mb-1">Appointment Details:</h6>
                            <div className="text-xs text-slate-400 space-y-1">
                              <p>Type: {notification.data.appointment_type}</p>
                              <p>Date: {new Date(notification.data.appointment_date).toLocaleDateString()} at {new Date(notification.data.appointment_date).toLocaleTimeString()}</p>
                              <p>Provider: {notification.data.provider_name}</p>
                              {notification.data.access_duration_hours && (
                                <p>Access Duration: {notification.data.access_duration_hours} hours after appointment</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Fallback to JSON for other notification types */}
                    {!(notification.notification_type === 'appointment_access_request' || 
                       notification.notification_type === 'access_auto_approved') && (
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                        {JSON.stringify(notification.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Appointment Details Modal */}
      {selectedAppointmentId && (
        <AppointmentDetailsModal
          open={appointmentModalOpen}
          onOpenChange={setAppointmentModalOpen}
          appointmentId={selectedAppointmentId}
          onAccessDecision={fetchNotifications}
        />
      )}
    </Card>
  );
};

export default EnhancedNotificationsPanel;