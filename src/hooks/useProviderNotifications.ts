import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProviderNotificationData {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  priority: 'normal' | 'high' | 'urgent';
  is_read: boolean;
  read_at: string | null;
  data: Record<string, any>;
  expires_at: string | null;
  created_at: string;
}

export function useProviderNotifications() {
  const [notifications, setNotifications] = useState<ProviderNotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching provider notifications:', error);
        return;
      }

      // Filter out expired notifications and ensure proper typing
      const validNotifications = (data || []).filter(notification => 
        !notification.expires_at || new Date(notification.expires_at) > new Date()
      ).map(notification => ({
        ...notification,
        priority: notification.priority as 'normal' | 'high' | 'urgent',
        data: notification.data as Record<string, any>
      }));

      setNotifications(validNotifications);
    } catch (error) {
      console.error('Error fetching provider notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('provider_notifications')
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
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('provider_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const removeNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('provider_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error removing notification:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('provider-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'provider_notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(notification => !notification.is_read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refetch: fetchNotifications
  };
}