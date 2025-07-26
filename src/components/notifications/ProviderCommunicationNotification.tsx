import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, User, Reply, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ProviderCommunicationNotificationProps {
  notification: {
    id: string;
    title: string;
    message: string;
    priority: 'normal' | 'high' | 'urgent';
    created_at: string;
    is_read: boolean;
    data: {
      communication_id: string;
      communication_type: 'message' | 'reminder' | 'instruction' | 'follow_up';
      subject: string;
      provider_name: string;
      requires_response: boolean;
      response_deadline?: string;
      priority: string;
    };
  };
  onMarkAsRead: (id: string) => void;
  onReply: (communicationId: string) => void;
  onViewMessage: (communicationId: string) => void;
}

export const ProviderCommunicationNotification: React.FC<ProviderCommunicationNotificationProps> = ({
  notification,
  onMarkAsRead,
  onReply,
  onViewMessage,
}) => {
  const getCommunicationTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return '🔔';
      case 'instruction':
        return '📋';
      case 'follow_up':
        return '👩‍⚕️';
      default:
        return '💬';
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

  const formatCommunicationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const isResponseOverdue = () => {
    if (!notification.data.response_deadline) return false;
    return new Date(notification.data.response_deadline) < new Date();
  };

  return (
    <Card className={`${!notification.is_read ? 'ring-2 ring-primary' : ''} mb-4`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getCommunicationTypeIcon(notification.data.communication_type)}</span>
            <CardTitle className="text-base">{notification.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(notification.data.priority)}>
              {notification.data.priority}
            </Badge>
            <Badge variant="outline">
              {formatCommunicationType(notification.data.communication_type)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {notification.data.provider_name}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm mb-1">Subject</h4>
          <p className="text-sm text-muted-foreground">
            {notification.data.subject}
          </p>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm">{notification.message}</p>
        </div>

        {notification.data.requires_response && (
          <div className={`p-3 border rounded-lg ${
            isResponseOverdue() 
              ? 'bg-destructive/10 border-destructive' 
              : 'bg-warning/10 border-warning'
          }`}>
            <div className="flex items-start gap-2">
              <Reply className={`h-4 w-4 mt-0.5 ${
                isResponseOverdue() ? 'text-destructive' : 'text-warning'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  isResponseOverdue() ? 'text-destructive' : 'text-warning'
                }`}>
                  {isResponseOverdue() ? 'Response Overdue' : 'Response Required'}
                </p>
                {notification.data.response_deadline && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    Due: {format(new Date(notification.data.response_deadline), 'MMM d, yyyy h:mm a')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onViewMessage(notification.data.communication_id)}
            className="flex-1"
            size="sm"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            View Message
          </Button>
          {notification.data.requires_response && (
            <Button
              onClick={() => onReply(notification.data.communication_id)}
              size="sm"
              variant={isResponseOverdue() ? 'destructive' : 'default'}
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          )}
          {!notification.is_read && (
            <Button
              variant="ghost"
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