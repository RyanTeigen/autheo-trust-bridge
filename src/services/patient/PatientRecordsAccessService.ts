import { supabase } from '@/integrations/supabase/client';

export interface SharedPatientRecord {
  id: string;
  patient_id: string;
  provider_id: string;
  record_type: string;
  encrypted_data: string;
  iv: string;
  created_at: string;
  record_hash: string;
}

export class PatientRecordsAccessService {
  /**
   * Get all medical records shared with the current patient user
   */
  static async getSharedRecords(): Promise<SharedPatientRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call the Postgres function to get shared records
      const { data, error } = await supabase.rpc('get_patient_records', {
        current_user_id: user.id
      });

      if (error) {
        console.error('Error fetching shared records:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSharedRecords:', error);
      throw error;
    }
  }

  /**
   * Revoke access to a medical record for a specific user
   */
  static async revokeAccess(medicalRecordId: string, granteeId: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('revoke_access', {
        body: {
          medical_record_id: medicalRecordId,
          grantee_id: granteeId
        }
      });

      if (error) {
        console.error('Error revoking access:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to revoke access');
      }
    } catch (error) {
      console.error('Error in revokeAccess:', error);
      throw error;
    }
  }

  /**
   * Get sharing permissions for a medical record
   */
  static async getSharingPermissions(medicalRecordId: string) {
    try {
      const { data, error } = await supabase
        .from('sharing_permissions')
        .select(`
          id,
          grantee_id,
          permission_type,
          status,
          created_at,
          expires_at,
          profiles:grantee_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('medical_record_id', medicalRecordId)
        .neq('status', 'revoked');

      if (error) {
        console.error('Error fetching sharing permissions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSharingPermissions:', error);
      throw error;
    }
  }
}