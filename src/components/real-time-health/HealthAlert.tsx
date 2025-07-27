import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export interface HealthAlertData {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface HealthAlertProps {
  alert: HealthAlertData;
  onResolve: (alertId: number) => void;
}

const HealthAlert: React.FC<HealthAlertProps> = ({ alert, onResolve }) => {
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>{alert.message}</span>
        {!alert.resolved && (
          <Button size="sm" onClick={() => onResolve(alert.id)}>
            Acknowledge
          </Button>
        )}
      </AlertTitle>
      <AlertDescription>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={getSeverityVariant(alert.severity)}>
            {alert.severity}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(alert.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default HealthAlert;