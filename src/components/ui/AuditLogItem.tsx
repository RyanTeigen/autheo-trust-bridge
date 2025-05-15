
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type AuditLogType = 'access' | 'disclosure' | 'breach' | 'admin' | 'amendment';

export interface AuditLogItemProps {
  id: string;
  type: AuditLogType;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error';
  className?: string;
}

export const AuditLogItem: React.FC<AuditLogItemProps> = ({
  type,
  timestamp,
  user,
  action,
  resource,
  status,
  className,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'access': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'disclosure': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'breach': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'admin': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'amendment': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
    }
  };

  return (
    <div className={cn("p-4 border rounded-md bg-card text-card-foreground", className)}>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className={getTypeColor()}>
              {type}
            </Badge>
            <Badge variant="outline" className={getStatusColor()}>
              {status}
            </Badge>
          </div>
          <p className="font-medium">{action}</p>
          <p className="text-sm text-muted-foreground mt-1">Resource: {resource}</p>
        </div>
        <div className="flex flex-col items-start md:items-end text-sm text-muted-foreground">
          <span>{new Date(timestamp).toLocaleString()}</span>
          <span>User: {user}</span>
        </div>
      </div>
    </div>
  );
};

export default AuditLogItem;
