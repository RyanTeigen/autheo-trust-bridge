
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'message' | 'access_granted' | 'access_revoked' | 'access_requested' | 'schedule' | 'clinical';
  read: boolean;
  data?: any;
}

const NotificationIndicator: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'New Message',
      description: 'Emma Johnson sent you a message about medication side effects',
      time: '3h ago',
      type: 'message',
      read: false
    },
    {
      id: 'n2',
      title: 'Access Request Approved',
      description: 'Your access request for patient records has been approved',
      time: '5h ago',
      type: 'access_granted',
      read: false
    },
    {
      id: 'n3',
      title: 'New Clinical Alert',
      description: 'Potential drug interaction detected for patient #P8392',
      time: '1d ago',
      type: 'clinical',
      read: true
    }
  ]);
  
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'message': return <Bell className="h-4 w-4 text-blue-400" />;
      case 'access_granted': return <Bell className="h-4 w-4 text-green-400" />;
      case 'access_revoked': return <Bell className="h-4 w-4 text-red-400" />;
      case 'access_requested': return <Bell className="h-4 w-4 text-orange-400" />;
      case 'schedule': return <Bell className="h-4 w-4 text-yellow-400" />;
      case 'clinical': return <Bell className="h-4 w-4 text-red-400" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
              onClick={markAllRead}
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
                  className={`p-4 relative ${!notification.read ? "bg-slate-100/5" : ""}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 p-1">
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${!notification.read ? "text-autheo-primary" : ""}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
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

export default NotificationIndicator;
