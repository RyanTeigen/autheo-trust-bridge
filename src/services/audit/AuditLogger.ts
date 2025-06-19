
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id?: string;
  user_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  status: 'success' | 'warning' | 'error';
  details?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;
  
  private constructor() {}
  
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async logEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'user_id'>): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare audit log entry
      const auditEntry: Partial<AuditLogEntry> = {
        user_id: user?.id,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resource_id,
        status: entry.status,
        details: entry.details,
        ip_address: entry.ip_address || this.getClientIP(),
        user_agent: entry.user_agent || navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      // Insert into audit_logs table
      const { error } = await supabase
        .from('audit_logs')
        .insert([auditEntry]);

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Error in audit logging:', error);
    }
  }

  private getClientIP(): string {
    // In a real application, you would get this from your server
    // For now, we'll use a placeholder
    return '127.0.0.1';
  }

  // Convenience methods for common audit events
  async logAccess(resource: string, resourceId?: string, details?: string): Promise<void> {
    await this.logEvent({
      action: 'ACCESS',
      resource,
      resource_id: resourceId,
      status: 'success',
      details
    });
  }

  async logCreate(resource: string, resourceId?: string, details?: string): Promise<void> {
    await this.logEvent({
      action: 'CREATE',
      resource,
      resource_id: resourceId,
      status: 'success',
      details
    });
  }

  async logUpdate(resource: string, resourceId?: string, details?: string): Promise<void> {
    await this.logEvent({
      action: 'UPDATE',
      resource,
      resource_id: resourceId,
      status: 'success',
      details
    });
  }

  async logDelete(resource: string, resourceId?: string, details?: string): Promise<void> {
    await this.logEvent({
      action: 'DELETE',
      resource,
      resource_id: resourceId,
      status: 'success',
      details
    });
  }

  async logError(action: string, resource: string, error: string, resourceId?: string): Promise<void> {
    await this.logEvent({
      action,
      resource,
      resource_id: resourceId,
      status: 'error',
      details: error
    });
  }

  async logWarning(action: string, resource: string, warning: string, resourceId?: string): Promise<void> {
    await this.logEvent({
      action,
      resource,
      resource_id: resourceId,
      status: 'warning',
      details: warning
    });
  }
}

export const auditLogger = AuditLogger.getInstance();
