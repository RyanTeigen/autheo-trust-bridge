
import { supabase } from '@/integrations/supabase/client';
import { hybridEncrypt, hybridDecrypt, HybridEncryptedData } from '@/utils/hybrid-encryption';
import { MLKEMKeyService } from './security/MLKEMKeyService';
import { PatientRecordsService } from './PatientRecordsService';

export interface QuantumSafeMedicalRecord {
  id: string;
  patient_id: string;
  encrypted_data: HybridEncryptedData;
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
  metadata: {
    algorithm: string;
    timestamp: string;
    quantumSafe: boolean;
  };
}

export class QuantumSafeMedicalRecordsService {
  /**
   * Initialize user with ML-KEM keypair if not exists
   */
  static async ensureUserKeypair(): Promise<{ publicKey: string; hasPrivateKey: boolean }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      return await MLKEMKeyService.ensureUserKeys(user.id);
    } catch (error) {
      console.error('Error ensuring user keypair:', error);
      return { publicKey: '', hasPrivateKey: false };
    }
  }

  /**
   * Create a quantum-safe encrypted medical record
   */
  static async createRecord(data: any, recordType: string = 'general'): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Ensure user has ML-KEM keypair
      const { publicKey, hasPrivateKey } = await this.ensureUserKeypair();
      if (!hasPrivateKey) {
        return { success: false, error: 'Failed to generate encryption keypair' };
      }

      // Ensure patient record exists
      const patientResult = await PatientRecordsService.getCurrentPatient();
      if (!patientResult.success) {
        return { success: false, error: 'Failed to get patient record' };
      }

      let patientId: string;
      if (!patientResult.data) {
        const createResult = await PatientRecordsService.createOrUpdatePatient({});
        if (!createResult.success || !createResult.data) {
          return { success: false, error: 'Failed to create patient record' };
        }
        patientId = createResult.data.id;
      } else {
        patientId = patientResult.data.id;
      }

      // Encrypt the data using quantum-safe hybrid encryption
      const encryptedRecord = await hybridEncrypt(JSON.stringify(data), publicKey);

      const { data: record, error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patientId,
          encrypted_data: JSON.stringify(encryptedRecord),
          record_type: recordType
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating quantum-safe medical record:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: record.id };
    } catch (error) {
      console.error('Error in createRecord:', error);
      return { success: false, error: 'Failed to create quantum-safe record' };
    }
  }

  /**
   * Get and decrypt quantum-safe medical records
   */
  static async getRecords(): Promise<{ success: boolean; records?: DecryptedMedicalRecord[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get user's private key
      const privateKey = MLKEMKeyService.getUserPrivateKey(user.id);
      if (!privateKey) {
        return { success: false, error: 'User private key not found' };
      }

      const result = await PatientRecordsService.getPatientMedicalRecords();
      if (!result.success || !result.records) {
        return { success: result.success, error: result.error };
      }

      // Decrypt the records
      const decryptedRecords: DecryptedMedicalRecord[] = [];
      
      for (const record of result.records) {
        try {
          let encryptedData: HybridEncryptedData;
          
          // Handle both new quantum-safe format and legacy format
          if (record.encrypted_data.includes('pqEncryptedKey')) {
            encryptedData = JSON.parse(record.encrypted_data);
          } else {
            // Legacy format - skip or migrate
            console.warn(`Record ${record.id} uses legacy encryption format`);
            continue;
          }

          const decryptionResult = await hybridDecrypt(encryptedData, privateKey);
          
          decryptedRecords.push({
            id: record.id,
            patient_id: record.patient_id,
            data: JSON.parse(decryptionResult.data),
            record_type: record.record_type || 'general',
            created_at: record.created_at,
            updated_at: record.updated_at,
            metadata: decryptionResult.metadata
          });
        } catch (decryptError) {
          console.error(`Error decrypting record ${record.id}:`, decryptError);
          // Continue with other records
        }
      }

      return { success: true, records: decryptedRecords };
    } catch (error) {
      console.error('Error in getRecords:', error);
      return { success: false, error: 'Failed to fetch quantum-safe records' };
    }
  }

  /**
   * Update a quantum-safe medical record
   */
  static async updateRecord(id: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get user's public key for re-encryption
      const publicKey = await MLKEMKeyService.getUserPublicKey(user.id);
      if (!publicKey) {
        return { success: false, error: 'User public key not found' };
      }

      // Re-encrypt the updated data
      const encryptedRecord = await hybridEncrypt(JSON.stringify(data), publicKey);

      const { error } = await supabase
        .from('medical_records')
        .update({
          encrypted_data: JSON.stringify(encryptedRecord)
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating quantum-safe medical record:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateRecord:', error);
      return { success: false, error: 'Failed to update quantum-safe record' };
    }
  }

  /**
   * Delete a quantum-safe medical record
   */
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
        console.error('Error deleting quantum-safe medical record:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteRecord:', error);
      return { success: false, error: 'Failed to delete quantum-safe record' };
    }
  }
}
