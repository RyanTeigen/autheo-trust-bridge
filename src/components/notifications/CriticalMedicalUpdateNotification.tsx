import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, User, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CriticalMedicalUpdateNotificationProps {
  notification: {
    id: string;
    title: string;
    message: string;
    priority: 'normal' | 'high' | 'urgent';
    created_at: string;
    is_read: boolean;
    data: {
      critical_update_id: string;
      update_type: string;
      provider_name: string;
      severity_level: 'high' | 'urgent' | 'critical';
      requires_immediate_attention: boolean;
      acknowledgment_required: boolean;
      metadata: Record<string, any>;
    };
  };
  onMarkAsRead: (id: string) => void;
  onAcknowledge: (updateId: string) => void;
  onViewDetails: (updateId: string) => void;
}

export const CriticalMedicalUpdateNotification: React.FC<CriticalMedicalUpdateNotificationProps> = ({
  notification,
  onMarkAsRead,
  onAcknowledge,
  onViewDetails,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getUpdateTypeIcon = (updateType: string) => {
    switch (updateType) {
      case 'medication_change':
        return '💊';
      case 'allergy_alert':
        return '⚠️';
      case 'emergency_contact':
        return '🚨';
      case 'treatment_plan':
        return '📋';
      default:
        return '📄';
    }
  };

  const formatUpdateType = (updateType: string) => {
    return updateType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className={`${!notification.is_read ? 'ring-2 ring-destructive' : ''} mb-4 border-l-4 border-l-destructive`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getUpdateTypeIcon(notification.data.update_type)}</span>
            <CardTitle className="text-base">{notification.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSeverityColor(notification.data.severity_level)}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {notification.data.severity_level}
            </Badge>
            {notification.data.requires_immediate_attention && (
              <Badge variant="destructive">
                <Shield className="h-3 w-3 mr-1" />
                Immediate
              </Badge>
            )}
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
          <h4 className="font-medium text-sm mb-1">Update Type</h4>
          <p className="text-sm text-muted-foreground">
            {formatUpdateType(notification.data.update_type)}
          </p>
        </div>

        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
          <p className="text-sm">{notification.message}</p>
        </div>

        {notification.data.requires_immediate_attention && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Immediate Attention Required</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This update requires your immediate review and may affect your current treatment.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onViewDetails(notification.data.critical_update_id)}
            className="flex-1"
            size="sm"
            variant={notification.data.severity_level === 'critical' ? 'destructive' : 'default'}
          >
            View Details
          </Button>
          {notification.data.acknowledgment_required && (
            <Button
              onClick={() => onAcknowledge(notification.data.critical_update_id)}
              size="sm"
              variant="outline"
            >
              Acknowledge
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