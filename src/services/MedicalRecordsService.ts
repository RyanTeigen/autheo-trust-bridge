import { supabase } from '@/integrations/supabase/client';
import { PatientRecordsService } from './PatientRecordsService';

// Simple encryption functions for medical records
const ENCRYPTION_KEY = 'medical-records-key-2024'; // In production, use proper key management

function encrypt(text: string): string {
  // Simple XOR encryption for demo purposes
  // In production, use proper encryption like AES
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return btoa(result); // Base64 encode
}

function decrypt(encryptedText: string): string {
  try {
    const decoded = atob(encryptedText); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

export interface MedicalRecord {
  id: string;
  user_id?: string;
  patient_id: string;
  encrypted_data: string;
  record_type: string;
  created_at: string;
  updated_at: string;
}

export interface DecryptedMedicalRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
}

export class MedicalRecordsService {
  static async createRecord(data: any, recordType: string = 'general'): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Ensure patient record exists
      const patientResult = await PatientRecordsService.getCurrentPatient();
      if (!patientResult.success) {
        return { success: false, error: 'Failed to get patient record' };
      }

      let patientId: string;
      if (!patientResult.data) {
        // Create patient record if it doesn't exist
        const createResult = await PatientRecordsService.createOrUpdatePatient({});
        if (!createResult.success || !createResult.data) {
          return { success: false, error: 'Failed to create patient record' };
        }
        patientId = createResult.data.id;
      } else {
        patientId = patientResult.data.id;
      }

      // Encrypt the data before storing
      const encryptedData = encrypt(JSON.stringify(data));

      const { data: record, error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patientId,
          encrypted_data: encryptedData,
          record_type: recordType
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating medical record:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: record.id };
    } catch (error) {
      console.error('Error in createRecord:', error);
      return { success: false, error: 'Failed to create record' };
    }
  }

  static async getRecords(): Promise<{ success: boolean; records?: DecryptedMedicalRecord[]; error?: string }> {
    try {
      const result = await PatientRecordsService.getPatientMedicalRecords();
      if (!result.success || !result.records) {
        return { success: result.success, error: result.error };
      }

      // Records are already decrypted from the enhanced service
      const decryptedRecords: DecryptedMedicalRecord[] = result.records.map(record => {
        try {
          // Check if data is already decrypted (from enhanced service) or needs decryption
          const recordData = record.data || (record as any).encrypted_data;
          const parsedData = typeof recordData === 'string' 
            ? (recordData.startsWith('{') ? JSON.parse(recordData) : JSON.parse(decrypt(recordData)))
            : recordData;
            
          return {
            id: record.id,
            patient_id: record.patient_id,
            data: parsedData,
            record_type: record.record_type || 'general',
            created_at: record.created_at,
            updated_at: record.updated_at
          };
        } catch (decryptError) {
          console.error('Error decrypting record:', decryptError);
          return {
            id: record.id,
            patient_id: record.patient_id,
            data: { error: 'Failed to decrypt record' },
            record_type: record.record_type || 'general',
            created_at: record.created_at,
            updated_at: record.updated_at
          };
        }
      });

      return { success: true, records: decryptedRecords };
    } catch (error) {
      console.error('Error in getRecords:', error);
      return { success: false, error: 'Failed to fetch records' };
    }
  }

  static async updateRecord(id: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Encrypt the updated data
      const encryptedData = encrypt(JSON.stringify(data));

      const { error } = await supabase
        .from('medical_records')
        .update({
          encrypted_data: encryptedData
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating medical record:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateRecord:', error);
      return { success: false, error: 'Failed to update record' };
    }
  }

  static async deleteRecord(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting medical record:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteRecord:', error);
      return { success: false, error: 'Failed to delete record' };
    }
  }
}
