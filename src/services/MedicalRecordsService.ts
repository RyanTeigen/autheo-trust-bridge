
import { supabase } from '@/integrations/supabase/client';

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
  user_id: string;
  encrypted_data: string;
  record_type: string;
  created_at: string;
  updated_at: string;
}

export interface DecryptedMedicalRecord {
  id: string;
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

      // Encrypt the data before storing
      const encryptedData = encrypt(JSON.stringify(data));

      const { data: record, error } = await supabase
        .from('medical_records')
        .insert({
          user_id: user.id,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: records, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching medical records:', error);
        return { success: false, error: error.message };
      }

      // Decrypt the records
      const decryptedRecords: DecryptedMedicalRecord[] = records.map(record => {
        try {
          const decryptedData = decrypt(record.encrypted_data);
          return {
            id: record.id,
            data: JSON.parse(decryptedData),
            record_type: record.record_type,
            created_at: record.created_at,
            updated_at: record.updated_at
          };
        } catch (decryptError) {
          console.error('Error decrypting record:', decryptError);
          return {
            id: record.id,
            data: { error: 'Failed to decrypt record' },
            record_type: record.record_type,
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
        .eq('id', id)
        .eq('user_id', user.id);

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
        .eq('id', id)
        .eq('user_id', user.id);

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
