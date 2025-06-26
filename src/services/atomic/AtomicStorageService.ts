
import { supabase } from '@/integrations/supabase/client';
import { FieldEncryption } from '@/services/security/FieldEncryption';
import { AtomicValue, AtomicDataPoint, AtomicStoreResult, AtomicServiceResult } from './types';

export class AtomicStorageService {
  private fieldEncryption = FieldEncryption.getInstance();

  /**
   * Store an atomic data point (encrypted)
   */
  async storeAtomicValue(
    recordId: string,
    atomicValue: AtomicValue
  ): Promise<AtomicStoreResult> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Encrypt the value
      const encryptedResult = await this.fieldEncryption.encryptField(
        String(atomicValue.value),
        'sensitive'
      );

      const { data, error } = await supabase
        .from('atomic_data_points')
        .insert({
          owner_id: user.id,
          record_id: recordId,
          data_type: atomicValue.data_type,
          enc_value: encryptedResult.encryptedData,
          unit: atomicValue.unit,
          metadata: {
            ...atomicValue.metadata,
            encryption_metadata: encryptedResult.metadata
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing atomic data point:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } catch (error) {
      console.error('Failed to store atomic value:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Retrieve and decrypt atomic data points for a record
   */
  async getAtomicValuesForRecord(recordId: string): Promise<AtomicServiceResult<(AtomicDataPoint & { decrypted_value?: string })[]>> {
    try {
      const { data, error } = await supabase
        .from('atomic_data_points')
        .select('*')
        .eq('record_id', recordId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching atomic data points:', error);
        return { success: false, error: error.message };
      }

      // Decrypt each value
      const decryptedData = await Promise.all(
        (data || []).map(async (point) => {
          try {
            // Safely access encryption_metadata with type checking
            const metadata = point.metadata as any;
            const encryptionMetadata = metadata?.encryption_metadata || {};

            const encryptionResult = {
              encryptedData: point.enc_value,
              metadata: encryptionMetadata
            };

            const decryptedResult = await this.fieldEncryption.decryptField(encryptionResult);
            
            return {
              ...point,
              decrypted_value: decryptedResult.isValid ? decryptedResult.decryptedData : '[DECRYPTION FAILED]'
            };
          } catch (decryptError) {
            console.error('Decryption error for point:', point.id, decryptError);
            return {
              ...point,
              decrypted_value: '[DECRYPTION ERROR]'
            };
          }
        })
      );

      return { success: true, data: decryptedData };
    } catch (error) {
      console.error('Failed to get atomic values:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get atomic data points by type for analytics/HE operations
   */
  async getAtomicValuesByType(dataType: string, limit = 100): Promise<AtomicServiceResult<AtomicDataPoint[]>> {
    try {
      const { data, error } = await supabase
        .from('atomic_data_points')
        .select('*')
        .eq('data_type', dataType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching atomic values by type:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Failed to get atomic values by type:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
