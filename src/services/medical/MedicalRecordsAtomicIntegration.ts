
import { atomicDataService } from '@/services/atomic/AtomicDataService';
import { RecordHashingUtils } from '@/utils/recordHashing';

export class MedicalRecordsAtomicIntegration {
  /**
   * Process a medical record and decompose it into atomic values
   */
  static async processRecordForAtomicDecomposition(
    recordId: string, 
    encryptedData: string,
    recordType: string
  ): Promise<{ success: boolean; atomicCount?: number; error?: string }> {
    try {
      // For demonstration, we'll parse common medical data structures
      let medicalData;
      
      try {
        medicalData = JSON.parse(encryptedData);
      } catch (parseError) {
        // If it's not JSON, treat as raw text data
        medicalData = { 
          content: encryptedData, 
          record_type: recordType,
          timestamp: new Date().toISOString()
        };
      }

      // Only decompose if we have structured data
      if (typeof medicalData === 'object' && medicalData !== null) {
        const result = await atomicDataService.decomposeToAtomicValues(recordId, medicalData);
        
        if (result.success) {
          console.log(`Successfully decomposed record ${recordId} into ${result.atomicCount} atomic values`);
          return { success: true, atomicCount: result.atomicCount };
        } else {
          console.warn(`Failed to decompose record ${recordId}:`, result.error);
          return { success: false, error: result.error };
        }
      } else {
        // For non-structured data, we can still store it as a single atomic value
        const atomicValue = {
          data_type: `raw_${recordType}`,
          value: String(medicalData),
          metadata: { 
            category: 'raw_data', 
            record_type: recordType,
            timestamp: new Date().toISOString()
          }
        };

        const result = await atomicDataService.storeAtomicValue(recordId, atomicValue);
        
        if (result.success) {
          console.log(`Stored raw data as atomic value for record ${recordId}`);
          return { success: true, atomicCount: 1 };
        } else {
          console.warn(`Failed to store raw data for record ${recordId}:`, result.error);
          return { success: false, error: result.error };
        }
      }
    } catch (error) {
      console.error('Error processing record for atomic decomposition:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Generate hash for atomic data points related to a record
   */
  static async generateAtomicDataHash(recordId: string): Promise<string | null> {
    try {
      const result = await atomicDataService.getAtomicValuesForRecord(recordId);
      
      if (result.success && result.data) {
        // Create a hash from all atomic values for this record
        const atomicDataString = JSON.stringify(
          result.data
            .sort((a, b) => a.created_at.localeCompare(b.created_at)) // Ensure consistent ordering
            .map(point => ({
              data_type: point.data_type,
              enc_value: point.enc_value,
              unit: point.unit,
              created_at: point.created_at
            }))
        );
        
        return await RecordHashingUtils.generateRecordHash({
          id: recordId,
          encrypted_data: atomicDataString,
          record_type: 'atomic_collection',
          created_at: new Date().toISOString()
        });
      }
      
      return null;
    } catch (error) {
      console.error('Error generating atomic data hash:', error);
      return null;
    }
  }

  /**
   * Get analytics data for homomorphic encryption operations
   */
  static async getHomomorphicAnalyticsData(dataType: string): Promise<{
    success: boolean;
    data?: {
      dataType: string;
      encryptedValues: string[];
      metadata: any[];
      count: number;
    };
    error?: string;
  }> {
    try {
      const result = await atomicDataService.getAtomicValuesByType(dataType, 1000);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            dataType,
            encryptedValues: result.data.map(point => point.enc_value),
            metadata: result.data.map(point => point.metadata),
            count: result.data.length
          }
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error getting homomorphic analytics data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
