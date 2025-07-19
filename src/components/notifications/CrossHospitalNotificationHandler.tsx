import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Hospital, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CrossHospitalNotificationData {
  request_id: string;
  provider_name: string;
  requesting_hospital_name: string;
  receiving_hospital_name: string;
  urgency_level: string;
  clinical_justification: string;
  request_type: string;
}

interface CrossHospitalNotificationHandlerProps {
  notification: {
    id: string;
    title: string;
    message: string;
    priority: 'normal' | 'high' | 'urgent';
    data: CrossHospitalNotificationData;
    created_at: string;
    is_read: boolean;
  };
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const CrossHospitalNotificationHandler: React.FC<CrossHospitalNotificationHandlerProps> = ({
  notification,
  onMarkAsRead,
  onDismiss
}) => {
  const navigate = useNavigate();

  const handleReviewRequest = () => {
    // Mark as read when user clicks to review
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate to cross-hospital consent page with request ID
    navigate(`/cross-hospital-consent?request_id=${notification.data.request_id}`);
  };

  const getPriorityIcon = () => {
    switch (notification.priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'high':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <Hospital className="h-4 w-4 text-blue-400" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-red-500 bg-red-950/20';
      case 'high':
        return 'border-yellow-500 bg-yellow-950/20';
      default:
        return 'border-blue-500 bg-blue-950/20';
    }
  };

  const timeAgo = new Date(notification.created_at).toLocaleString();

  return (
    <Card className={`p-4 mb-3 ${getPriorityColor()} border ${!notification.is_read ? 'ring-2 ring-autheo-primary' : ''}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getPriorityIcon()}
            <div>
              <h4 className="font-semibold text-slate-100">{notification.title}</h4>
              <p className="text-xs text-slate-400">{timeAgo}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {notification.priority.toUpperCase()}
            </Badge>
            {!notification.is_read && (
              <Badge variant="outline" className="text-xs bg-autheo-primary/20 text-autheo-primary border-autheo-primary">
                NEW
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className="text-sm text-slate-300">{notification.message}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>
              <span className="font-medium">Requesting Hospital:</span>
              <br />
              {notification.data.requesting_hospital_name}
            </div>
            <div>
              <span className="font-medium">Previous Hospital:</span>
              <br />
              {notification.data.receiving_hospital_name}
            </div>
          </div>

          {notification.data.clinical_justification && (
            <div className="p-2 bg-slate-800/50 rounded text-xs text-slate-300">
              <span className="font-medium">Clinical Justification:</span>
              <br />
              {notification.data.clinical_justification}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDismiss(notification.id)}
            className="text-slate-400 border-slate-600"
          >
            Dismiss
          </Button>
          
          <div className="space-x-2">
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="text-slate-400"
              >
                Mark as Read
              </Button>
            )}
            <Button
              onClick={handleReviewRequest}
              size="sm"
              className="bg-autheo-primary text-slate-900 hover:bg-autheo-primary/90"
            >
              Review Request
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};