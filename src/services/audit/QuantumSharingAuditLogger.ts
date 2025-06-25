
import { supabase } from '@/integrations/supabase/client';
import { RecordSharingAuditLogger } from './RecordSharingAuditLogger';

export class QuantumSharingAuditLogger extends RecordSharingAuditLogger {
  static async logQuantumKeyGeneration(
    userId: string,
    keyType: string,
    success: boolean = true
  ): Promise<void> {
    const event = {
      action: 'QUANTUM_KEY_GENERATED',
      resource: 'Quantum Encryption',
      status: success ? 'success' as const : 'error' as const,
      details: `Generated ${keyType} quantum-safe key pair`,
      target_type: 'encryption_key',
      target_id: userId,
      metadata: {
        key_type: keyType,
        quantum_safe: true,
        algorithm: 'ML-KEM'
      }
    };

    await this.logAuditEvent(event);
  }

  static async logQuantumEncryption(
    recordId: string,
    recordType: string,
    recipientId: string,
    encryptionMetadata: Record<string, any>,
    success: boolean = true
  ): Promise<void> {
    const event = {
      action: 'QUANTUM_RECORD_ENCRYPTED',
      resource: 'Medical Records',
      status: success ? 'success' as const : 'error' as const,
      details: `Applied quantum-safe encryption to ${recordType} record`,
      target_type: 'medical_record',
      target_id: recordId,
      metadata: {
        record_type: recordType,
        recipient_id: recipientId,
        encryption_algorithm: 'ML-KEM',
        ...encryptionMetadata
      }
    };

    await this.logAuditEvent(event);
  }

  static async logQuantumShareAccessAttempt(
    shareId: string,
    recordType: string,
    accessSuccess: boolean,
    failureReason?: string
  ): Promise<void> {
    const event = {
      action: 'QUANTUM_SHARE_ACCESS_ATTEMPT',
      resource: 'Medical Records',
      status: accessSuccess ? 'success' as const : 'warning' as const,
      details: accessSuccess 
        ? `Successfully accessed quantum-shared ${recordType} record`
        : `Failed to access quantum-shared ${recordType} record: ${failureReason}`,
      target_type: 'record_share',
      target_id: shareId,
      metadata: {
        record_type: recordType,
        access_success: accessSuccess,
        failure_reason: failureReason,
        quantum_decryption: true
      }
    };

    await this.logAuditEvent(event);
  }

  private static async logAuditEvent(event: any): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        console.warn('Cannot log quantum audit event: No authenticated user');
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
          ip_address: '127.0.0.1'
        });

      if (error) {
        console.error('Failed to log quantum audit event:', error);
      } else {
        console.log('Quantum audit event logged successfully:', event.action);
      }
    } catch (error) {
      console.error('Error logging quantum audit event:', error);
    }
  }
}
