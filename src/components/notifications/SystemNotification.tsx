import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, AlertTriangle, AlertCircle, Settings, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SystemNotificationProps {
  notification: {
    id: string;
    title: string;
    message: string;
    created_at: string;
    read_at?: string;
    dismissed_at?: string;
    data: {
      notification_type: 'system_update' | 'security_alert' | 'maintenance' | 'feature_update';
      severity: 'info' | 'warning' | 'error' | 'critical';
      action_required: boolean;
      action_url?: string;
      action_text?: string;
    };
  };
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onTakeAction?: (actionUrl: string) => void;
}

export const SystemNotification: React.FC<SystemNotificationProps> = ({
  notification,
  onMarkAsRead,
  onDismiss,
  onTakeAction,
}) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Info className="h-4 w-4 text-info" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-info text-info-foreground';
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'system_update':
        return '🔄';
      case 'security_alert':
        return '🔒';
      case 'maintenance':
        return '🔧';
      case 'feature_update':
        return '✨';
      default:
        return '📢';
    }
  };

  const formatNotificationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const isRead = !!notification.read_at;
  const isDismissed = !!notification.dismissed_at;

  return (
    <Card className={`mb-4 ${!isRead && !isDismissed ? 'ring-2 ring-primary' : ''} ${
      notification.data.severity === 'critical' ? 'border-l-4 border-l-destructive' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getNotificationTypeIcon(notification.data.notification_type)}</span>
            <div className="flex items-center gap-2">
              {getSeverityIcon(notification.data.severity)}
              <CardTitle className="text-base">{notification.title}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSeverityColor(notification.data.severity)}>
              {notification.data.severity}
            </Badge>
            <Badge variant="outline">
              {formatNotificationType(notification.data.notification_type)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          {isDismissed && (
            <Badge variant="outline" className="text-xs">
              Dismissed
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className={`p-3 rounded-lg ${
          notification.data.severity === 'critical' 
            ? 'bg-destructive/10 border border-destructive/20'
            : notification.data.severity === 'warning'
            ? 'bg-warning/10 border border-warning/20'
            : 'bg-muted/50'
        }`}>
          <p className="text-sm">{notification.message}</p>
        </div>

        {notification.data.action_required && (
          <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 text-info mt-0.5" />
              <div>
                <p className="text-sm font-medium text-info">Action Required</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This notification requires your attention to ensure system security and functionality.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {notification.data.action_url && notification.data.action_text && onTakeAction && (
            <Button 
              onClick={() => onTakeAction(notification.data.action_url!)}
              className="flex-1"
              size="sm"
              variant={notification.data.severity === 'critical' ? 'destructive' : 'default'}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {notification.data.action_text}
            </Button>
          )}
          
          {!isRead && (
            <Button
              variant="outline"
              onClick={() => onMarkAsRead(notification.id)}
              size="sm"
            >
              Mark as Read
            </Button>
          )}
          
          {!isDismissed && (
            <Button
              variant="ghost"
              onClick={() => onDismiss(notification.id)}
              size="sm"
            >
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};