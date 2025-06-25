
// services/encryption/MedicalRecordsEncryption.ts

import { supabase } from '@/integrations/supabase/client';
import { 
  encryptRecord, 
  decryptRecord, 
  encryptRecordForSelf, 
  decryptRecordForSelf 
} from '@/utils/encryption/record';
import { 
  ensureUserKeys, 
  loadPrivateKeyFromLocal, 
  getUserPublicKey 
} from '@/utils/encryption/keys';

export interface EncryptedMedicalRecord {
  id: string;
  patient_id: string;
  encrypted_data: string;
  iv: string;
  record_type: string;
  created_at: string;
  updated_at: string;
}

export interface DecryptedRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    algorithm: string;
    timestamp: string;
    encrypted: boolean;
  };
}

export class MedicalRecordsEncryption {
  // -- Encrypt medical record data --
  static async encryptMedicalRecord(data: any, userId: string): Promise<{ encrypted_data: string; iv: string }> {
    const { privateKey, publicKey } = await ensureUserKeys(userId);
    
    if (!privateKey || !publicKey) {
      throw new Error('Unable to generate encryption keys');
    }

    const encrypted = await encryptRecordForSelf(data, privateKey);
    return {
      encrypted_data: encrypted.ciphertext,
      iv: encrypted.iv
    };
  }

  // -- Alias for consistency --
  static async encryptRecordData(data: any, userId?: string): Promise<{ encrypted_data: string; iv: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    const userIdToUse = userId || user?.id;
    if (!userIdToUse) {
      throw new Error('User not authenticated');
    }
    return this.encryptMedicalRecord(data, userIdToUse);
  }

  // -- Decrypt medical record data --
  static async decryptMedicalRecord(
    encrypted_data: string, 
    iv: string, 
    userId: string
  ): Promise<any> {
    const privateKey = await loadPrivateKeyFromLocal();
    const publicKey = await getUserPublicKey(userId);
    
    if (!privateKey || !publicKey) {
      throw new Error('Encryption keys not available');
    }

    return await decryptRecordForSelf({ iv, ciphertext: encrypted_data }, privateKey);
  }

  // -- Decrypt single record --
  static async decryptSingleRecord(record: any): Promise<DecryptedRecord> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const decryptedData = await this.decryptMedicalRecord(
      record.encrypted_data,
      record.iv,
      user.id
    );

    return {
      id: record.id,
      patient_id: record.patient_id,
      data: decryptedData,
      record_type: record.record_type,
      created_at: record.created_at,
      updated_at: record.updated_at,
      metadata: {
        algorithm: 'AES-GCM + X25519',
        timestamp: new Date().toISOString(),
        encrypted: true
      }
    };
  }

  // -- Decrypt multiple records --
  static async decryptRecords(records: any[]): Promise<DecryptedRecord[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const decryptedRecords = [];
    for (const record of records) {
      try {
        const decrypted = await this.decryptSingleRecord(record);
        decryptedRecords.push(decrypted);
      } catch (error) {
        console.error(`Failed to decrypt record ${record.id}:`, error);
      }
    }
    return decryptedRecords;
  }

  // -- Create encrypted medical record --
  static async createEncryptedRecord(
    data: any, 
    recordType: string = 'general'
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get or create patient record
      let { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let patientId = patientData?.id;
      
      if (!patientId) {
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({ 
            id: crypto.randomUUID(),
            user_id: user.id,
            full_name: user.user_metadata?.full_name || user.email || 'Unknown',
            email: user.email
          })
          .select('id')
          .single();
        
        if (createError) {
          console.error('Error creating patient:', createError);
          return { success: false, error: 'Failed to create patient record' };
        }
        
        patientId = newPatient?.id;
      }

      if (!patientId) {
        return { success: false, error: 'Failed to create patient record' };
      }

      // Encrypt the record
      const { encrypted_data, iv } = await this.encryptMedicalRecord(data, user.id);

      // Save to database
      const { data: record, error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patientId,
          encrypted_data,
          iv,
          record_type: recordType
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: record.id };
    } catch (error) {
      console.error('Error creating encrypted record:', error);
      return { success: false, error: 'Failed to create encrypted record' };
    }
  }

  // -- Get and decrypt medical records --
  static async getDecryptedRecords(): Promise<{ success: boolean; records?: DecryptedRecord[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get patient records - for now, just get all records where we can access them
      const { data: records, error } = await supabase
        .from('medical_records')
        .select(`
          id,
          encrypted_data,
          iv,
          record_type,
          created_at,
          updated_at,
          patient_id,
          patients!inner (
            id,
            user_id
          )
        `)
        .eq('patients.user_id', user.id);

      if (error) {
        console.error('Database error:', error);
        return { success: false, error: error.message };
      }

      // Decrypt each record
      const decryptedRecords = await this.decryptRecords(records || []);

      return { success: true, records: decryptedRecords };
    } catch (error) {
      console.error('Error getting decrypted records:', error);
      return { success: false, error: 'Failed to get decrypted records' };
    }
  }
}

// Legacy export for compatibility
export const decrypt = (encrypted: string): any => {
  throw new Error('decrypt function deprecated - use MedicalRecordsEncryption.decryptMedicalRecord instead');
};
