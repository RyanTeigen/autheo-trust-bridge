
import React, { useState } from 'react';
import { Bell, X, Clock, Calendar, FileText, Heart, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { AppointmentAccessHandler } from './AppointmentAccessHandler';
import { formatDistanceToNow } from 'date-fns';

export interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refetch
  } = useNotifications();
  
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'appointment_access_request': return <Calendar className="h-4 w-4 text-blue-400" />;
      case 'access_granted': 
      case 'access_approved': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'access_auto_approved': return <Shield className="h-4 w-4 text-green-400" />;
      case 'access_request': return <Shield className="h-4 w-4 text-yellow-400" />;
      case 'medication': return <Clock className="h-4 w-4 text-green-400" />;
      case 'record': return <Heart className="h-4 w-4 text-autheo-primary" />;
      case 'message': return <FileText className="h-4 w-4 text-yellow-400" />;
      default: return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'normal': return 'text-slate-300';
      default: return 'text-slate-300';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const handleAccessDecision = () => {
    refetch();
    setOpen(false);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-autheo-primary text-white text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-slate-800 border-slate-700" align="end">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h4 className="font-medium text-slate-200">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 text-slate-400 hover:text-slate-200"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-autheo-primary"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-4 relative hover:bg-slate-700/30 transition-colors",
                    !notification.is_read && "bg-slate-700/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 p-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "font-medium text-sm",
                            !notification.is_read && "text-autheo-primary",
                            notification.is_read && "text-slate-200"
                          )}>
                            {notification.title}
                          </p>
                          {notification.priority === 'urgent' && (
                            <AlertTriangle className="h-3 w-3 text-red-400" />
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 -mr-1 opacity-60 hover:opacity-100 text-slate-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className={cn(
                        "text-sm mt-1 line-clamp-2",
                        getPriorityColor(notification.priority)
                      )}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>

                      {/* Special handling for appointment access requests */}
                      {notification.notification_type === 'appointment_access_request' && !notification.is_read && (
                        <div className="mt-3">
                          <AppointmentAccessHandler
                            notification={notification}
                            onDecision={handleAccessDecision}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-slate-700 text-center">
          <Button 
            variant="link" 
            className="text-autheo-primary text-xs hover:text-autheo-primary/80"
            onClick={() => setOpen(false)}
          >
            Close notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
