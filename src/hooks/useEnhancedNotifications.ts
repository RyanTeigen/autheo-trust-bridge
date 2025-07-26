import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnhancedNotification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
  data: any;
  expires_at?: string;
}

export const useEnhancedNotifications = () => {
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notificationData = data || [];
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.is_read).length);
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
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => prev - 1);
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
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);

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

  const createTestResultNotification = async (data: {
    patient_id: string;
    test_type: string;
    test_name: string;
    result_status: 'available' | 'critical' | 'normal' | 'abnormal';
    provider_id: string;
    medical_record_id?: string;
    result_summary?: string;
    requires_action?: boolean;
    action_required?: string;
    priority_level?: 'normal' | 'high' | 'urgent' | 'critical';
  }) => {
    try {
      const { error } = await supabase
        .from('medical_test_notifications')
        .insert([data]);

      if (error) throw error;

      // Refresh notifications to get the new one
      await fetchNotifications();
      
      toast({
        title: "Test Result Available",
        description: `Your ${data.test_name} results are ready`,
      });
    } catch (error) {
      console.error('Error creating test result notification:', error);
      throw error;
    }
  };

  const createCriticalUpdate = async (data: {
    patient_id: string;
    provider_id: string;
    update_type: string;
    title: string;
    message: string;
    severity_level?: 'high' | 'urgent' | 'critical';
    requires_immediate_attention?: boolean;
    acknowledgment_required?: boolean;
    related_record_id?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      const { error } = await supabase
        .from('critical_medical_updates')
        .insert([data]);

      if (error) throw error;

      await fetchNotifications();
      
      toast({
        title: "Critical Medical Update",
        description: data.title,
        variant: data.severity_level === 'critical' ? 'destructive' : 'default',
      });
    } catch (error) {
      console.error('Error creating critical update:', error);
      throw error;
    }
  };

  const createProviderCommunication = async (data: {
    patient_id: string;
    provider_id: string;
    communication_type: 'message' | 'reminder' | 'instruction' | 'follow_up';
    subject: string;
    message: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    requires_response?: boolean;
    response_deadline?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      const { error } = await supabase
        .from('provider_communications')
        .insert([data]);

      if (error) throw error;

      await fetchNotifications();
      
      toast({
        title: "New Message",
        description: `Message from your healthcare provider: ${data.subject}`,
      });
    } catch (error) {
      console.error('Error creating provider communication:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('enhanced_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'patient_notifications'
        },
        (payload) => {
          const newNotification = payload.new as EnhancedNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: "New Notification",
            description: newNotification.title,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'patient_notifications'
        },
        (payload) => {
          const updatedNotification = payload.new as EnhancedNotification;
          setNotifications(prev =>
            prev.map(notif =>
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    createTestResultNotification,
    createCriticalUpdate,
    createProviderCommunication
  };
};