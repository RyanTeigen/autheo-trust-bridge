import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MedicalTestResultNotificationProps {
  notification: {
    id: string;
    title: string;
    message: string;
    priority: 'normal' | 'high' | 'urgent';
    created_at: string;
    is_read: boolean;
    data: {
      test_notification_id: string;
      test_type: string;
      test_name: string;
      result_status: 'available' | 'critical' | 'normal' | 'abnormal';
      provider_name: string;
      requires_action: boolean;
      action_required?: string;
    };
  };
  onMarkAsRead: (id: string) => void;
  onViewResults: (testId: string) => void;
}

export const MedicalTestResultNotification: React.FC<MedicalTestResultNotificationProps> = ({
  notification,
  onMarkAsRead,
  onViewResults,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'abnormal':
        return 'bg-warning text-warning-foreground';
      case 'normal':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'abnormal':
        return <AlertTriangle className="h-4 w-4" />;
      case 'normal':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className={`${!notification.is_read ? 'ring-2 ring-primary' : ''} mb-4`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(notification.data.result_status)}
            <CardTitle className="text-base">{notification.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(notification.priority)}>
              {notification.priority}
            </Badge>
            <Badge className={getStatusColor(notification.data.result_status)}>
              {notification.data.result_status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm mb-1">Test Details</h4>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{notification.data.test_name}</span> ({notification.data.test_type})
          </p>
          <p className="text-sm text-muted-foreground">
            From: {notification.data.provider_name}
          </p>
        </div>

        <p className="text-sm">{notification.message}</p>

        {notification.data.requires_action && notification.data.action_required && (
          <div className="p-3 bg-warning/10 border border-warning rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">Action Required</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.data.action_required}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onViewResults(notification.data.test_notification_id)}
            className="flex-1"
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Results
          </Button>
          {!notification.is_read && (
            <Button
              variant="outline"
              onClick={() => onMarkAsRead(notification.id)}
              size="sm"
            >
              Mark as Read
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};