import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, AlertCircle } from 'lucide-react';

interface NotificationNodeData {
  type: 'email' | 'sms' | 'in-app' | 'urgent';
  recipients: string[];
  subject?: string;
  template?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

interface NotificationNodeProps {
  data: NotificationNodeData;
  isConnectable: boolean;
}

export const NotificationNode = memo(({ data, isConnectable }: NotificationNodeProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'urgent': return <AlertCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success';
      case 'sent': return 'bg-primary';
      case 'failed': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      
      <Card className="w-64 border-accent/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {getIcon(data.type)}
            <CardTitle className="text-sm">Notification</CardTitle>
            <Badge variant="secondary" className={getStatusColor(data.status)}>
              {data.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {data.type.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className={getPriorityColor(data.priority)}>
              {data.priority}
            </Badge>
          </div>
          
          {data.subject && (
            <div className="space-y-1">
              <p className="text-xs font-medium">Subject:</p>
              <p className="text-xs text-muted-foreground">{data.subject}</p>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-medium">
              Recipients ({data.recipients.length}):
            </p>
            <div className="text-xs text-muted-foreground">
              {data.recipients.slice(0, 2).join(', ')}
              {data.recipients.length > 2 && ` +${data.recipients.length - 2} more`}
            </div>
          </div>

          {data.scheduledFor && (
            <div className="text-xs text-muted-foreground">
              Scheduled: {data.scheduledFor}
            </div>
          )}

          {data.template && (
            <div className="text-xs text-muted-foreground">
              Template: {data.template}
            </div>
          )}
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
    </>
  );
});

NotificationNode.displayName = 'NotificationNode';