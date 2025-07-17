import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Shield, Clock, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import SimplifiedApprovalModal from './SimplifiedApprovalModal';

interface Notification {
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
  actionable?: boolean;
  request_id?: string;
}

interface PendingRequest {
  id: string;
  grantee_id: string;
  permission_type: string;
  created_at: string;
  medical_record_id: string;
  patient_id: string;
  status: string;
  expires_at: string | null;
  urgency_level?: string;
  clinical_justification?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  medical_records?: {
    record_type: string;
  } | null;
}

const EnhancedNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time listener
    if (user) {
      const channel = supabase
        .channel('enhanced_notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'patient_notifications'
          },
          (payload) => {
            handleRealtimeNotification(payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data: patientData } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patientData) return;

      const { data: notificationsData } = await supabase
        .from('patient_notifications')
        .select('*')
        .eq('patient_id', patientData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Enhance notifications with actionable data
      const enhancedNotifications = (notificationsData || []).map(notification => ({
        ...notification,
        actionable: notification.notification_type === 'access_request' && !notification.is_read,
        request_id: typeof notification.data === 'object' && notification.data ? (notification.data as any)?.request_id : undefined
      }));

      setNotifications(enhancedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleRealtimeNotification = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newNotification = payload.new;
      
      // Play audio alert for urgent notifications
      if (audioEnabled && newNotification.priority === 'urgent') {
        playNotificationSound(newNotification);
      }
      
      // Show system notification
      showSystemNotification(newNotification);
      
      // Refresh notifications
      fetchNotifications();
    }
  };

  const playNotificationSound = (notification: Notification) => {
    if ('speechSynthesis' in window) {
      const message = notification.notification_type === 'access_request' 
        ? `Urgent: New access request from a healthcare provider for your ${notification.data?.record_type || 'medical records'}`
        : notification.message;
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const showSystemNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  };

  const handleQuickAction = async (notification: Notification, action: 'approve' | 'deny') => {
    if (!notification.request_id) return;

    try {
      // Fetch the full request details
      const { data: requestData } = await supabase
        .from('sharing_permissions')
        .select(`
          *,
          profiles:grantee_id (first_name, last_name, email),
          medical_records:medical_record_id (record_type)
        `)
        .eq('id', notification.request_id)
        .single();

      if (!requestData) return;

      const { error } = await supabase.functions.invoke('respond_to_access_request', {
        body: {
          medical_record_id: requestData.medical_record_id,
          grantee_id: requestData.grantee_id,
          decision: action === 'approve' ? 'approved' : 'rejected',
          note: `Quick ${action} via notification center`
        }
      });

      if (error) throw error;

      // Mark notification as read
      await markAsRead(notification.id);

      toast({
        title: action === 'approve' ? "✅ Request Approved" : "❌ Request Denied",
        description: `Successfully ${action === 'approve' ? 'approved' : 'denied'} the access request`,
      });

    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive"
      });
    }
  };

  const handleDetailedReview = async (notification: Notification) => {
    if (!notification.request_id) return;

    try {
      const { data: requestData } = await supabase
        .from('sharing_permissions')
        .select(`
          *,
          profiles:grantee_id (first_name, last_name, email),
          medical_records:medical_record_id (record_type)
        `)
        .eq('id', notification.request_id)
        .single();

      if (requestData) {
        setSelectedRequest(requestData as PendingRequest);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('patient_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.is_read).length;

  return (
    <>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-5 w-5 text-blue-400" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </div>
                )}
              </div>
              <span className="text-slate-100">Notifications</span>
              {urgentCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {urgentCount} Urgent
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <Switch
                  checked={audioEnabled}
                  onCheckedChange={setAudioEnabled}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    notification.is_read 
                      ? 'bg-slate-700/50 border-slate-600' 
                      : notification.priority === 'urgent'
                        ? 'bg-red-500/10 border-red-500 border-2 animate-pulse'
                        : 'bg-blue-500/10 border-blue-500 border-2'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {notification.notification_type === 'access_request' ? (
                          <Shield className="h-5 w-5 text-blue-400" />
                        ) : notification.priority === 'urgent' ? (
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        ) : (
                          <Bell className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-200">
                            {notification.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={
                              notification.priority === 'urgent' 
                                ? 'border-red-500 text-red-300' 
                                : 'border-slate-500'
                            }
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-300 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    
                    {!notification.is_read && (
                      <Button
                        onClick={() => markAsRead(notification.id)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:bg-slate-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Quick Actions for Access Requests */}
                  {notification.actionable && notification.notification_type === 'access_request' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-600">
                      <Button
                        onClick={() => handleQuickAction(notification, 'approve')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Quick Approve
                      </Button>
                      <Button
                        onClick={() => handleQuickAction(notification, 'deny')}
                        variant="destructive"
                        size="sm"
                      >
                        Quick Deny
                      </Button>
                      <Button
                        onClick={() => handleDetailedReview(notification)}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Review Details
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <SimplifiedApprovalModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        request={selectedRequest}
        onApprove={(request, note) => {
          // Handle approval
          setIsModalOpen(false);
          fetchNotifications();
        }}
        onDeny={(request, note) => {
          // Handle denial
          setIsModalOpen(false);
          fetchNotifications();
        }}
      />
    </>
  );
};

export default EnhancedNotificationCenter;