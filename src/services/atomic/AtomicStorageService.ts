
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
      console.log('Starting atomic value storage process...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return { success: false, error: 'User not authenticated' };
      }

      console.log('User authenticated, ensuring encryption is ready...');

      // Ensure encryption is properly initialized with retries
      let initAttempts = 0;
      const maxAttempts = 3;
      
      while (initAttempts < maxAttempts) {
        try {
          if (!this.fieldEncryption.isReady()) {
            console.log(`Encryption not ready, initializing... (attempt ${initAttempts + 1})`);
            await this.fieldEncryption.initialize();
          }
          
          if (this.fieldEncryption.isReady()) {
            console.log('Encryption is now ready');
            break;
          }
          
          initAttempts++;
          if (initAttempts >= maxAttempts) {
            throw new Error(`Failed to initialize encryption after ${maxAttempts} attempts`);
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (initError) {
          console.error(`Encryption initialization attempt ${initAttempts + 1} failed:`, initError);
          initAttempts++;
          
          if (initAttempts >= maxAttempts) {
            return { 
              success: false, 
              error: `Encryption initialization failed after ${maxAttempts} attempts: ${initError instanceof Error ? initError.message : 'Unknown error'}` 
            };
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Encrypt the value
      console.log('Encrypting atomic value...');
      const encryptedResult = await this.fieldEncryption.encryptField(
        String(atomicValue.value),
        'sensitive'
      );

      console.log('Encryption completed, storing in database...');

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
        console.error('Database error storing atomic data point:', error);
        return { success: false, error: error.message };
      }

      console.log('Atomic data point stored successfully:', data.id);
      return { success: true, id: data.id };
    } catch (error) {
      console.error('Failed to store atomic value:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during atomic value storage' 
      };
    }
  }

  /**
   * Retrieve and decrypt atomic data points for a record
   */
  async getAtomicValuesForRecord(recordId: string): Promise<AtomicServiceResult<(AtomicDataPoint & { decrypted_value?: string })[]>> {
    try {
      console.log('Fetching atomic data points for record:', recordId);
      
      const { data, error } = await supabase
        .from('atomic_data_points')
        .select('*')
        .eq('record_id', recordId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching atomic data points:', error);
        return { success: false, error: error.message };
      }

      console.log(`Found ${data?.length || 0} atomic data points`);

      // Ensure encryption is ready for decryption with retries
      let initAttempts = 0;
      const maxAttempts = 3;
      
      while (initAttempts < maxAttempts && !this.fieldEncryption.isReady()) {
        try {
          console.log(`Encryption not ready for decryption, initializing... (attempt ${initAttempts + 1})`);
          await this.fieldEncryption.initialize();
          initAttempts++;
        } catch (initError) {
          console.error(`Decryption initialization attempt ${initAttempts + 1} failed:`, initError);
          initAttempts++;
          if (initAttempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (!this.fieldEncryption.isReady()) {
        console.warn('Encryption not ready for decryption, returning encrypted data');
        return { 
          success: true, 
          data: (data || []).map(point => ({
            ...this.convertToAtomicDataPoint(point),
            decrypted_value: '[ENCRYPTION_NOT_READY]'
          }))
        };
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
              ...this.convertToAtomicDataPoint(point),
              decrypted_value: decryptedResult.isValid ? decryptedResult.decryptedData : '[DECRYPTION_FAILED]'
            };
          } catch (decryptError) {
            console.error('Decryption error for point:', point.id, decryptError);
            return {
              ...this.convertToAtomicDataPoint(point),
              decrypted_value: '[DECRYPTION_ERROR]'
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

      return { 
        success: true, 
        data: (data || []).map(point => this.convertToAtomicDataPoint(point))
      };
    } catch (error) {
      console.error('Failed to get atomic values by type:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Convert Supabase result to AtomicDataPoint type
   */
  private convertToAtomicDataPoint(point: any): AtomicDataPoint {
    return {
      id: point.id,
      owner_id: point.owner_id,
      record_id: point.record_id,
      data_type: point.data_type,
      enc_value: point.enc_value,
      unit: point.unit || undefined,
      metadata: (point.metadata && typeof point.metadata === 'object') ? point.metadata as Record<string, any> : undefined,
      created_at: point.created_at || '',
      updated_at: point.updated_at || ''
    };
  }
}
