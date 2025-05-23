
import React from 'react';
import { SecurityAlert } from './types';
import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface SecurityAlertsListProps {
  alerts: SecurityAlert[];
}

const SecurityAlertsList: React.FC<SecurityAlertsListProps> = ({ alerts }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 mr-1" />;
    }
  };
  
  const sortedAlerts = [...alerts].sort((a, b) => {
    // Sort by resolved (unresolved first)
    if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
    
    // Then by severity (critical first)
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    if (a.severity !== b.severity) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    
    // Then by timestamp (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedAlerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No security alerts to display</p>
        </div>
      ) : (
        sortedAlerts.map(alert => (
          <div 
            key={alert.id} 
            className={`p-4 border rounded-md ${alert.resolved ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="mr-4">
                  <Badge className={`${getSeverityColor(alert.severity)} flex items-center`}>
                    {getSeverityIcon(alert.severity)}
                    {alert.severity}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Source: {alert.source} • {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div>
                {alert.resolved ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1 border-0">
                    <Check className="h-3 w-3" /> Resolved
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm">
                    Investigate
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SecurityAlertsList;
