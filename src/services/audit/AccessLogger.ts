import { supabase } from '@/integrations/supabase/client';

export interface AccessLogEntry {
  patient_id: string;
  provider_id?: string;
  record_id: string;
  action: string;
}

export class AccessLogger {
  /**
   * Log access to a medical record in the access_logs table
   */
  static async logRecordAccess(entry: AccessLogEntry): Promise<void> {
    try {
      const { error } = await supabase
        .from('access_logs')
        .insert({
          patient_id: entry.patient_id,
          provider_id: entry.provider_id,
          record_id: entry.record_id,
          action: entry.action,
          log_timestamp: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to log record access:', error);
        // Don't throw error to avoid breaking the main flow
      }
    } catch (error) {
      console.error('Error logging record access:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log medical record view access
   */
  static async logRecordView(recordId: string, patientId: string, providerId?: string): Promise<void> {
    await this.logRecordAccess({
      record_id: recordId,
      patient_id: patientId,
      provider_id: providerId,
      action: 'viewed',
    });
  }

  /**
   * Log medical record update access
   */
  static async logRecordUpdate(recordId: string, patientId: string, providerId?: string): Promise<void> {
    await this.logRecordAccess({
      record_id: recordId,
      patient_id: patientId,
      provider_id: providerId,
      action: 'updated',
    });
  }

  /**
   * Log medical record download access
   */
  static async logRecordDownload(recordId: string, patientId: string, providerId?: string): Promise<void> {
    await this.logRecordAccess({
      record_id: recordId,
      patient_id: patientId,
      provider_id: providerId,
      action: 'downloaded',
    });
  }

  /**
   * Log medical record creation access
   */
  static async logRecordCreate(recordId: string, patientId: string, providerId?: string): Promise<void> {
    await this.logRecordAccess({
      record_id: recordId,
      patient_id: patientId,
      provider_id: providerId,
      action: 'created',
    });
  }

  /**
   * Log medical record sharing access
   */
  static async logRecordShare(recordId: string, patientId: string, providerId?: string): Promise<void> {
    await this.logRecordAccess({
      record_id: recordId,
      patient_id: patientId,
      provider_id: providerId,
      action: 'shared',
    });
  }
}