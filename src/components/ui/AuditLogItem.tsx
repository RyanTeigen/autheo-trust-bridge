
import React from 'react';
import { Badge } from './badge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Network,
  MapPin,
  Monitor,
  Info
} from 'lucide-react';
import { AuditLogEntry } from '@/services/audit/AuditLogEntry';

export type AuditLogItemProps = AuditLogEntry;

const AuditLogItem: React.FC<AuditLogItemProps> = ({
  type,
  action,
  timestamp,
  user,
  resource,
  status,
  details,
  ipAddress,
  location,
  browser,
  os,
  duration
}) => {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleString();
  
  const getStatusBadge = () => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Success</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Error</Badge>;
      default:
        return null;
    }
  };
  
  const getTypeIcon = () => {
    switch (type) {
      case 'access':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'disclosure':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'amendment':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'login':
        return <Shield className="h-5 w-5 text-amber-500" />;
      case 'logout':
        return <Shield className="h-5 w-5 text-slate-500" />;
      case 'breach':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'admin':
        return <Shield className="h-5 w-5 text-indigo-500" />;
      default:
        return <Info className="h-5 w-5 text-slate-500" />;
    }
  };
  
  return (
    <div className="border rounded-md p-4 bg-card">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
        <div className="flex gap-3">
          <div className="shrink-0">
            {getTypeIcon()}
          </div>
          <div>
            <h3 className="font-medium">{action}</h3>
            <div className="text-sm text-muted-foreground">{resource}</div>
            {details && <div className="mt-1 text-sm">{details}</div>}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {user && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {user}
                </span>
              )}
              {ipAddress && (
                <span className="flex items-center gap-1">
                  <Network className="h-3.5 w-3.5" />
                  {ipAddress}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
              {(browser || os) && (
                <span className="flex items-center gap-1">
                  <Monitor className="h-3.5 w-3.5" />
                  {browser}{os && `/${os}`}
                </span>
              )}
              {duration !== undefined && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {duration}ms
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="h-3 w-3 mr-1" />
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogItem;
