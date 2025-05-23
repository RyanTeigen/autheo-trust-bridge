import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, AlertCircle, Eye, EyeOff, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type NotificationType = 'access_granted' | 'access_revoked' | 'access_requested' | 'access_expired';

interface AccessNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  created_at: string;
  is_read: boolean;
  reference_id?: string;
}

const AccessNotifications: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AccessNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .in('type', ['access_granted', 'access_revoked', 'access_requested', 'access_expired'])
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Cast the data to ensure type safety
        const typedNotifications = (data || []).map(notification => ({
          ...notification,
          type: notification.type as NotificationType
        }));
        
        setNotifications(typedNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  const handleMarkAsRead = async (id: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
      
    } catch (err) {
      console.error("Error marking notification as read:", err);
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      });
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    const unreadIds = notifications
      .filter(notification => !notification.is_read)
      .map(notification => notification.id);
      
    if (unreadIds.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive",
      });
    }
  };
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'access_granted':
        return <Eye className="h-5 w-5 text-green-600" />;
      case 'access_revoked':
        return <EyeOff className="h-5 w-5 text-red-600" />;
      case 'access_requested':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'access_expired':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-slate-600" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    // If it's today, show time only
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };
  
  const unreadCount = notifications.filter(notification => !notification.is_read).length;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            Access Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-4 w-4 mr-1" /> Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-6 border rounded-md bg-slate-50">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No access notifications</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {displayedNotifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`flex gap-3 p-3 rounded-md ${
                    notification.is_read ? 'bg-white' : 'bg-blue-50'
                  } border`}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className={`font-medium ${notification.is_read ? '' : 'text-blue-800'}`}>
                        {notification.title}
                      </h4>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(notification.created_at)}
                      </div>
                    </div>
                    
                    <p className="text-sm mt-1 text-muted-foreground">
                      {notification.message}
                    </p>
                    
                    {!notification.is_read && (
                      <div className="mt-2 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3 mr-1" /> Mark as read
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {notifications.length > 5 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Show fewer' : `Show all (${notifications.length})`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessNotifications;
