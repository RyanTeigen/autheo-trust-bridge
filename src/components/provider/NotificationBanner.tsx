
import React from 'react';
import { Bell, X, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProviderNotificationData } from '@/hooks/useProviderNotifications';

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'warning';
  message: string;
  timestamp: string;
}

interface NotificationBannerProps {
  notifications: ProviderNotificationData[];
  onDismiss: (id: string) => void;
  onNotificationClick?: (notification: ProviderNotificationData) => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notifications, onDismiss, onNotificationClick }) => {
  if (notifications.length === 0) return null;

  return (
    <Card className="bg-slate-800 border-slate-700 mb-6">
      <div className="p-4">
        {notifications.map((notification) => {
          const notificationType = notification.priority === 'urgent' ? 'alert' : 
                                 notification.priority === 'high' ? 'warning' : 'info';
          const timeAgo = new Date(notification.created_at).toLocaleString();
          
          const isClickable = notification.notification_type?.includes('access_') || 
                             notification.notification_type?.includes('cross_hospital_');
          
          return (
            <div 
              key={notification.id}
              className={`flex items-center justify-between mb-2 p-3 rounded-md ${
                notificationType === 'alert' ? 'bg-red-900/30 border border-red-800' :
                notificationType === 'warning' ? 'bg-amber-900/30 border border-amber-800' :
                'bg-slate-700/50 border border-slate-600'
              } ${!notification.is_read ? 'border-l-4 border-l-autheo-primary' : ''} ${
                isClickable ? 'cursor-pointer hover:bg-slate-600/50 transition-colors' : ''
              }`}
              onClick={isClickable ? () => onNotificationClick?.(notification) : undefined}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <Bell className="h-4 w-4 text-autheo-primary" />
                  <Badge 
                    variant={notificationType === 'alert' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {notification.priority.toUpperCase()}
                  </Badge>
                  <span className="font-medium text-slate-200">{notification.title}</span>
                   {!notification.is_read && (
                    <Badge variant="outline" className="text-xs bg-autheo-primary/20 text-autheo-primary border-autheo-primary">
                      NEW
                    </Badge>
                  )}
                  {isClickable && (
                    <Badge variant="outline" className="text-xs bg-green-900/20 text-green-400 border-green-600">
                      CLICK TO VIEW
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300">{notification.message}</p>
                <span className="text-xs text-slate-500">{timeAgo}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 ml-3" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(notification.id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default NotificationBanner;
