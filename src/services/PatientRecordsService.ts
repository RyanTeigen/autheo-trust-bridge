
import { supabase } from '@/integrations/supabase/client';
import { Patient, MedicalRecord, SharingPermission, DecryptedMedicalRecord } from '@/types/medical';

export class PatientRecordsService {
  // Create or update patient profile
  static async createOrUpdatePatient(patientData: Partial<Patient>): Promise<{ success: boolean; patient?: Patient; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: patient, error } = await supabase
        .from('patients')
        .upsert({
          id: user.id, // Use auth user ID as patient ID
          user_id: user.id,
          ...patientData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating patient:', error);
        return { success: false, error: error.message };
      }

      return { success: true, patient };
    } catch (error) {
      console.error('Error in createOrUpdatePatient:', error);
      return { success: false, error: 'Failed to create/update patient record' };
    }
  }

  // Get current user's patient record
  static async getCurrentPatient(): Promise<{ success: boolean; patient?: Patient; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No patient record found
          return { success: true, patient: undefined };
        }
        console.error('Error fetching patient:', error);
        return { success: false, error: error.message };
      }

      return { success: true, patient };
    } catch (error) {
      console.error('Error in getCurrentPatient:', error);
      return { success: false, error: 'Failed to fetch patient record' };
    }
  }

  // Get medical records for current patient
  static async getPatientMedicalRecords(): Promise<{ success: boolean; records?: MedicalRecord[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // First get the patient record
      const patientResult = await this.getCurrentPatient();
      if (!patientResult.success || !patientResult.patient) {
        return { success: false, error: 'Patient record not found' };
      }

      const { data: records, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientResult.patient.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching medical records:', error);
        return { success: false, error: error.message };
      }

      return { success: true, records: records || [] };
    } catch (error) {
      console.error('Error in getPatientMedicalRecords:', error);
      return { success: false, error: 'Failed to fetch medical records' };
    }
  }

  // Share medical record with provider
  static async shareRecordWithProvider(
    medicalRecordId: string, 
    granteeId: string, 
    permissionType: 'read' | 'write',
    expiresAt?: string
  ): Promise<{ success: boolean; permission?: SharingPermission; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get current patient
      const patientResult = await this.getCurrentPatient();
      if (!patientResult.success || !patientResult.patient) {
        return { success: false, error: 'Patient record not found' };
      }

      const { data: permission, error } = await supabase
        .from('sharing_permissions')
        .insert({
          patient_id: patientResult.patient.id,
          grantee_id: granteeId,
          medical_record_id: medicalRecordId,
          permission_type: permissionType,
          expires_at: expiresAt || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating sharing permission:', error);
        return { success: false, error: error.message };
      }

      return { success: true, permission };
    } catch (error) {
      console.error('Error in shareRecordWithProvider:', error);
      return { success: false, error: 'Failed to share record' };
    }
  }

  // Get sharing permissions for current patient
  static async getSharingPermissions(): Promise<{ success: boolean; permissions?: SharingPermission[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const patientResult = await this.getCurrentPatient();
      if (!patientResult.success || !patientResult.patient) {
        return { success: false, error: 'Patient record not found' };
      }

      const { data: permissions, error } = await supabase
        .from('sharing_permissions')
        .select('*')
        .eq('patient_id', patientResult.patient.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sharing permissions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, permissions: permissions || [] };
    } catch (error) {
      console.error('Error in getSharingPermissions:', error);
      return { success: false, error: 'Failed to fetch sharing permissions' };
    }
  }

  // Revoke sharing permission
  static async revokeSharingPermission(permissionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('sharing_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) {
        console.error('Error revoking sharing permission:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in revokeSharingPermission:', error);
      return { success: false, error: 'Failed to revoke sharing permission' };
    }
  }
}
