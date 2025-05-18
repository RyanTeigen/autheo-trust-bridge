
import React from 'react';
import { Bell, X, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'warning';
  message: string;
  timestamp: string;
}

interface NotificationBannerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <Card className="bg-slate-800 border-slate-700 mb-6">
      <div className="p-4">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={`flex items-center justify-between mb-2 p-2 rounded-md ${
              notification.type === 'alert' ? 'bg-red-900/30 border border-red-800' :
              notification.type === 'warning' ? 'bg-amber-900/30 border border-amber-800' :
              'bg-slate-700/50 border border-slate-600'
            }`}
          >
            <div className="flex items-center">
              <Bell className="h-4 w-4 mr-2 text-autheo-primary" />
              <span className="text-sm text-slate-200">{notification.message}</span>
              <Badge variant="outline" className="ml-2 text-xs bg-slate-700/50">
                {notification.timestamp}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => onDismiss(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default NotificationBanner;
