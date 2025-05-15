
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, User, FileText, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export type AuditLogType = 'access' | 'disclosure' | 'breach' | 'admin' | 'amendment' | 'login' | 'logout';

export interface AuditLogItemProps {
  id: string;
  type: AuditLogType;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error';
  details?: string;
  ipAddress?: string;
  resourceId?: string;
  duration?: number;
  location?: string;
  browser?: string;
  os?: string;
  className?: string;
}

export const AuditLogItem: React.FC<AuditLogItemProps> = ({
  type,
  timestamp,
  user,
  action,
  resource,
  status,
  details,
  ipAddress,
  resourceId,
  duration,
  location,
  browser,
  os,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

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
      case 'login': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'logout': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'access': return <FileText className="h-4 w-4 mr-1" />;
      case 'disclosure': return <User className="h-4 w-4 mr-1" />;
      case 'breach': return <ShieldAlert className="h-4 w-4 mr-1" />;
      case 'admin': return <Shield className="h-4 w-4 mr-1" />;
      case 'amendment': return <FileText className="h-4 w-4 mr-1" />;
      case 'login': return <User className="h-4 w-4 mr-1" />;
      case 'logout': return <User className="h-4 w-4 mr-1" />;
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={cn("p-4 border rounded-md bg-card text-card-foreground", className)}>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className={getTypeColor()}>
              <span className="flex items-center">
                {getTypeIcon()}
                {type}
              </span>
            </Badge>
            <Badge variant="outline" className={getStatusColor()}>
              {status}
            </Badge>
          </div>
          <p className="font-medium">{action}</p>
          <p className="text-sm text-muted-foreground mt-1">Resource: {resource}</p>
          {details && (
            <p className="text-sm text-muted-foreground mt-1">{details}</p>
          )}
        </div>
        <div className="flex flex-col items-start md:items-end text-sm text-muted-foreground">
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {new Date(timestamp).toLocaleString()}
          </span>
          <span>User: {user}</span>
          {ipAddress && <span>IP: {ipAddress}</span>}
        </div>
      </div>
      
      <div className="mt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs w-full flex items-center justify-center"
          onClick={toggleExpanded}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" /> Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" /> View Details
            </>
          )}
        </Button>
        
        {expanded && (
          <div className="mt-2 border-t pt-2">
            <Table>
              <TableBody>
                {resourceId && (
                  <TableRow>
                    <TableCell className="py-1 font-medium">Resource ID</TableCell>
                    <TableCell className="py-1">{resourceId}</TableCell>
                  </TableRow>
                )}
                {duration !== undefined && (
                  <TableRow>
                    <TableCell className="py-1 font-medium">Duration</TableCell>
                    <TableCell className="py-1">{duration}ms</TableCell>
                  </TableRow>
                )}
                {browser && (
                  <TableRow>
                    <TableCell className="py-1 font-medium">Browser</TableCell>
                    <TableCell className="py-1">{browser}</TableCell>
                  </TableRow>
                )}
                {os && (
                  <TableRow>
                    <TableCell className="py-1 font-medium">OS</TableCell>
                    <TableCell className="py-1">{os}</TableCell>
                  </TableRow>
                )}
                {location && (
                  <TableRow>
                    <TableCell className="py-1 font-medium">Location</TableCell>
                    <TableCell className="py-1">{location}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="py-1 font-medium">Timestamp</TableCell>
                  <TableCell className="py-1">{new Date(timestamp).toISOString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogItem;
