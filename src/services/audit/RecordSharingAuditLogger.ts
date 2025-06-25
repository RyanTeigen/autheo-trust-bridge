
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLogEvent {
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error';
  details?: string;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, any>;
}

export class RecordSharingAuditLogger {
  private static async getCurrentUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  }

  private static async logEvent(event: AuditLogEvent): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn('Cannot log audit event: No authenticated user');
        return;
      }

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: event.action,
          resource: event.resource,
          status: event.status,
          details: event.details,
          target_type: event.target_type,
          target_id: event.target_id,
          metadata: event.metadata,
          timestamp: new Date().toISOString(),
          ip_address: '127.0.0.1' // In production, this would be the actual client IP
        });

      if (error) {
        console.error('Failed to log audit event:', error);
      } else {
        console.log('Audit event logged successfully:', event.action);
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  static async logRecordShared(
    recordId: string, 
    recordType: string, 
    recipientId: string, 
    recipientName: string,
    success: boolean = true
  ): Promise<void> {
    await this.logEvent({
      action: 'RECORD_SHARED',
      resource: 'Medical Records',
      status: success ? 'success' : 'error',
      details: `Shared ${recordType} record with ${recipientName}`,
      target_type: 'medical_record',
      target_id: recordId,
      metadata: {
        record_type: recordType,
        recipient_id: recipientId,
        recipient_name: recipientName,
        sharing_method: 'standard'
      }
    });
  }

  static async logRecordShareRevoked(
    shareId: string,
    recordType: string,
    recipientName: string,
    success: boolean = true
  ): Promise<void> {
    await this.logEvent({
      action: 'RECORD_SHARE_REVOKED',
      resource: 'Medical Records',
      status: success ? 'success' : 'error',
      details: `Revoked access to ${recordType} record from ${recipientName}`,
      target_type: 'sharing_permission',
      target_id: shareId,
      metadata: {
        record_type: recordType,
        recipient_name: recipientName,
        revocation_reason: 'user_initiated'
      }
    });
  }

  static async logQuantumRecordShared(
    recordId: string,
    recordType: string,
    recipientId: string,
    recipientName: string,
    encryptionMethod: string,
    success: boolean = true
  ): Promise<void> {
    await this.logEvent({
      action: 'QUANTUM_RECORD_SHARED',
      resource: 'Medical Records',
      status: success ? 'success' : 'error',
      details: `Shared ${recordType} record with ${recipientName} using quantum-safe encryption`,
      target_type: 'medical_record',
      target_id: recordId,
      metadata: {
        record_type: recordType,
        recipient_id: recipientId,
        recipient_name: recipientName,
        encryption_method: encryptionMethod,
        sharing_method: 'quantum_safe'
      }
    });
  }

  static async logShareAttemptFailed(
    recordType: string,
    recipientName: string,
    errorReason: string
  ): Promise<void> {
    await this.logEvent({
      action: 'RECORD_SHARE_FAILED',
      resource: 'Medical Records',
      status: 'error',
      details: `Failed to share ${recordType} record with ${recipientName}: ${errorReason}`,
      target_type: 'medical_record',
      metadata: {
        record_type: recordType,
        recipient_name: recipientName,
        error_reason: errorReason,
        failure_type: 'sharing_permission_creation'
      }
    });
  }

  static async logUnauthorizedShareAttempt(
    recordType: string,
    attemptedAction: string
  ): Promise<void> {
    await this.logEvent({
      action: 'UNAUTHORIZED_SHARE_ATTEMPT',
      resource: 'Medical Records',
      status: 'warning',
      details: `Unauthorized attempt to ${attemptedAction} ${recordType} record`,
      target_type: 'medical_record',
      metadata: {
        record_type: recordType,
        attempted_action: attemptedAction,
        security_violation: true
      }
    });
  }
}
