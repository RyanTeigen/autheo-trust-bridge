
export type AuditLogType = 'access' | 'disclosure' | 'amendment' | 'login' | 'logout' | 'breach' | 'admin';

export interface AuditLogEntry {
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
}
