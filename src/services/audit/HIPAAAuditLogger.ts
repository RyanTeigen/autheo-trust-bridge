// HIPAA-compliant audit logging service
import { supabase } from '@/integrations/supabase/client';

export type AuditEventType = 
  | 'login' | 'logout' | 'login_failed'
  | 'phi_access' | 'phi_create' | 'phi_update' | 'phi_delete' | 'phi_export'
  | 'permission_grant' | 'permission_revoke' | 'role_change'
  | 'system_access' | 'configuration_change' | 'backup_restore';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogEntry {
  eventType: AuditEventType;
  severity?: AuditSeverity;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  phiAccessed?: boolean;
  actionPerformed: string;
  details?: Record<string, any>;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  complianceFlags?: Record<string, any>;
}

export class HIPAAAuditLogger {
  private static instance: HIPAAAuditLogger;
  private sessionId: string | null = null;

  public static getInstance(): HIPAAAuditLogger {
    if (!HIPAAAuditLogger.instance) {
      HIPAAAuditLogger.instance = new HIPAAAuditLogger();
    }
    return HIPAAAuditLogger.instance;
  }

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getClientInfo(): Promise<{ ipAddress?: string; userAgent?: string }> {
    try {
      // Get IP address from a service (in production, you'd use a proper service)
      const userAgent = navigator.userAgent;
      
      // Note: Getting real IP address requires server-side implementation
      // For now, we'll use a placeholder
      return {
        userAgent,
        ipAddress: 'client-side' // This should be populated server-side
      };
    } catch (error) {
      console.error('Error getting client info:', error);
      return {};
    }
  }

  public async logEvent(entry: AuditLogEntry): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const clientInfo = await this.getClientInfo();

      const auditEntry = {
        event_type: entry.eventType,
        severity: entry.severity || 'info',
        user_id: entry.userId || user?.id,
        session_id: this.sessionId,
        ip_address: entry.ipAddress || clientInfo.ipAddress,
        user_agent: entry.userAgent || clientInfo.userAgent,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        phi_accessed: entry.phiAccessed || false,
        action_performed: entry.actionPerformed,
        details: entry.details || {},
        before_state: entry.beforeState,
        after_state: entry.afterState,
        compliance_flags: entry.complianceFlags || {}
      };

      const { error } = await supabase
        .from('enhanced_audit_logs')
        .insert(auditEntry);

      if (error) {
        console.error('Failed to log audit event:', error);
        // In production, you might want to have a fallback logging mechanism
      }
    } catch (error) {
      console.error('Error in audit logging:', error);
    }
  }

  // Convenience methods for common audit events
  public async logLogin(userId: string, success: boolean): Promise<void> {
    await this.logEvent({
      eventType: success ? 'login' : 'login_failed',
      severity: success ? 'info' : 'warning',
      userId,
      actionPerformed: success ? 'User logged in successfully' : 'Login attempt failed',
      complianceFlags: { authentication_event: true }
    });
  }

  public async logLogout(userId: string): Promise<void> {
    await this.logEvent({
      eventType: 'logout',
      severity: 'info',
      userId,
      actionPerformed: 'User logged out',
      complianceFlags: { authentication_event: true }
    });
  }

  public async logPHIAccess(resourceType: string, resourceId: string, action: string): Promise<void> {
    await this.logEvent({
      eventType: 'phi_access',
      severity: 'info',
      resourceType,
      resourceId,
      phiAccessed: true,
      actionPerformed: `PHI ${action}: ${resourceType}`,
      complianceFlags: { 
        phi_access: true,
        requires_disclosure_tracking: true
      }
    });
  }

  public async logPHIModification(
    resourceType: string, 
    resourceId: string, 
    action: 'create' | 'update' | 'delete',
    beforeState?: Record<string, any>,
    afterState?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      eventType: `phi_${action}` as AuditEventType,
      severity: action === 'delete' ? 'warning' : 'info',
      resourceType,
      resourceId,
      phiAccessed: true,
      actionPerformed: `PHI ${action}: ${resourceType}`,
      beforeState,
      afterState,
      complianceFlags: { 
        phi_modification: true,
        requires_audit_review: action === 'delete'
      }
    });
  }

  public async logPermissionChange(
    targetUserId: string,
    action: 'grant' | 'revoke',
    permission: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      eventType: action === 'grant' ? 'permission_grant' : 'permission_revoke',
      severity: 'warning',
      actionPerformed: `Permission ${action}: ${permission}`,
      details: {
        target_user_id: targetUserId,
        permission,
        ...details
      },
      complianceFlags: { 
        access_control_change: true,
        requires_supervisor_review: true
      }
    });
  }

  public async logSystemAccess(action: string, details?: Record<string, any>): Promise<void> {
    await this.logEvent({
      eventType: 'system_access',
      severity: 'info',
      actionPerformed: action,
      details,
      complianceFlags: { system_access: true }
    });
  }

  // Export audit logs for compliance reporting
  public async exportAuditLogs(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('enhanced_audit_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Log the export action
      await this.logEvent({
        eventType: 'phi_export',
        severity: 'warning',
        actionPerformed: 'Audit logs exported',
        details: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          record_count: data?.length || 0
        },
        complianceFlags: { 
          data_export: true,
          requires_authorization: true
        }
      });

      return data || [];
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const auditLogger = HIPAAAuditLogger.getInstance();