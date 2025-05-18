
import React, { useState } from 'react';
import { Bell, X, Clock, Calendar, FileText, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'appointment' | 'medication' | 'record' | 'message' | 'system';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Upcoming Appointment',
    description: 'Dr. Sarah Johnson tomorrow at 2:30 PM',
    time: '1 hour ago',
    read: false,
    type: 'appointment'
  },
  {
    id: '2',
    title: 'Medication Reminder',
    description: 'Take your Lisinopril medication',
    time: '3 hours ago',
    read: false,
    type: 'medication'
  },
  {
    id: '3',
    title: 'New Health Record',
    description: 'Lab results from your recent blood test are available',
    time: '1 day ago',
    read: true,
    type: 'record'
  },
  {
    id: '4',
    title: 'Message from Dr. Lee',
    description: 'Please review your updated care plan',
    time: '2 days ago',
    read: true,
    type: 'message'
  }
];

export interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch(type) {
      case 'appointment': return <Calendar className="h-4 w-4 text-blue-400" />;
      case 'medication': return <Clock className="h-4 w-4 text-green-400" />;
      case 'record': return <Heart className="h-4 w-4 text-autheo-primary" />;
      case 'message': return <FileText className="h-4 w-4 text-yellow-400" />;
      default: return <Bell className="h-4 w-4 text-gray-400" />;
    }
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
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-4 relative",
                    !notification.read && "bg-slate-100/5"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 p-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={cn("font-medium text-sm", !notification.read && "text-autheo-primary")}>
                          {notification.title}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 -mr-1 opacity-60 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>No notifications</p>
            </div>
          )}
        </div>
        
        <div className="p-2 border-t text-center">
          <Button 
            variant="link" 
            className="text-autheo-primary text-xs"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
