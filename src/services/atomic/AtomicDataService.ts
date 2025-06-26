
import { supabase } from '@/integrations/supabase/client';
import { FieldEncryption } from '@/services/security/FieldEncryption';

export interface AtomicDataPoint {
  id: string;
  owner_id: string;
  record_id: string;
  data_type: string;
  enc_value: string;
  unit?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AtomicValue {
  data_type: string;
  value: string | number;
  unit?: string;
  metadata?: any;
}

export class AtomicDataService {
  private fieldEncryption = FieldEncryption.getInstance();

  /**
   * Store an atomic data point (encrypted)
   */
  async storeAtomicValue(
    recordId: string,
    atomicValue: AtomicValue
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Encrypt the value
      const encryptedResult = await this.fieldEncryption.encryptField(
        String(atomicValue.value),
        'sensitive'
      );

      const { data, error } = await supabase
        .from('atomic_data_points')
        .insert({
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
  async getAtomicValuesForRecord(recordId: string): Promise<{
    success: boolean;
    data?: (AtomicDataPoint & { decrypted_value?: string })[];
    error?: string;
  }> {
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
            const encryptionResult = {
              encryptedData: point.enc_value,
              metadata: point.metadata?.encryption_metadata || {}
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
   * Break down complex medical data into atomic values
   */
  async decomposeToAtomicValues(recordId: string, medicalData: any): Promise<{
    success: boolean;
    atomicCount?: number;
    error?: string;
  }> {
    try {
      const atomicValues: AtomicValue[] = [];

      // Parse different types of medical data into atomic values
      if (medicalData.vitals) {
        if (medicalData.vitals.blood_pressure) {
          const bp = medicalData.vitals.blood_pressure;
          if (bp.systolic) {
            atomicValues.push({
              data_type: 'blood_pressure_systolic',
              value: bp.systolic,
              unit: 'mmHg',
              metadata: { category: 'vitals', timestamp: medicalData.timestamp }
            });
          }
          if (bp.diastolic) {
            atomicValues.push({
              data_type: 'blood_pressure_diastolic',
              value: bp.diastolic,
              unit: 'mmHg',
              metadata: { category: 'vitals', timestamp: medicalData.timestamp }
            });
          }
        }

        if (medicalData.vitals.heart_rate) {
          atomicValues.push({
            data_type: 'heart_rate',
            value: medicalData.vitals.heart_rate,
            unit: 'bpm',
            metadata: { category: 'vitals', timestamp: medicalData.timestamp }
          });
        }

        if (medicalData.vitals.temperature) {
          atomicValues.push({
            data_type: 'temperature',
            value: medicalData.vitals.temperature,
            unit: '°F',
            metadata: { category: 'vitals', timestamp: medicalData.timestamp }
          });
        }
      }

      if (medicalData.lab_results) {
        Object.entries(medicalData.lab_results).forEach(([key, result]: [string, any]) => {
          if (result.value !== undefined) {
            atomicValues.push({
              data_type: `lab_${key}`,
              value: result.value,
              unit: result.unit,
              metadata: { 
                category: 'lab_results', 
                timestamp: medicalData.timestamp,
                normal_range: result.normal_range
              }
            });
          }
        });
      }

      // Store all atomic values
      const results = await Promise.all(
        atomicValues.map(value => this.storeAtomicValue(recordId, value))
      );

      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        console.error('Some atomic values failed to store:', failures);
        return { 
          success: false, 
          error: `${failures.length} atomic values failed to store` 
        };
      }

      return { success: true, atomicCount: atomicValues.length };
    } catch (error) {
      console.error('Failed to decompose to atomic values:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get atomic data points by type for analytics/HE operations
   */
  async getAtomicValuesByType(dataType: string, limit = 100): Promise<{
    success: boolean;
    data?: AtomicDataPoint[];
    error?: string;
  }> {
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

export const atomicDataService = new AtomicDataService();
