
import { supabase } from '@/integrations/supabase/client';

export interface AtomicDataFields {
  [key: string]: string | number;
}

export interface AtomicDataInsertRequest {
  record_id: string;
  fields: AtomicDataFields;
}

export interface AtomicDataInsertResponse {
  success: boolean;
  inserted_count?: number;
  message?: string;
  error?: string;
}

export class AtomicDataAPIService {
  private static instance: AtomicDataAPIService;

  public static getInstance(): AtomicDataAPIService {
    if (!AtomicDataAPIService.instance) {
      AtomicDataAPIService.instance = new AtomicDataAPIService();
    }
    return AtomicDataAPIService.instance;
  }

  /**
   * Insert atomic data points via API endpoint
   */
  async insertAtomicData(
    recordId: string, 
    fields: AtomicDataFields
  ): Promise<AtomicDataInsertResponse> {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get encryption key from localStorage
      const encryptionKey = localStorage.getItem('userEncryptionKey') || 
                           localStorage.getItem(`encryption_key_${session.user.id}`);
      
      if (!encryptionKey) {
        return { success: false, error: 'Encryption key not found' };
      }

      const response = await fetch('/functions/v1/atomic-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'x-encryption-key': encryptionKey,
        },
        body: JSON.stringify({
          record_id: recordId,
          fields
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to insert atomic data' };
      }

      return result;
    } catch (error) {
      console.error('Error inserting atomic data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Batch insert multiple records with atomic data
   */
  async batchInsertAtomicData(
    requests: AtomicDataInsertRequest[]
  ): Promise<AtomicDataInsertResponse[]> {
    const results = await Promise.all(
      requests.map(request => 
        this.insertAtomicData(request.record_id, request.fields)
      )
    );
    
    return results;
  }

  /**
   * Insert common vital signs as atomic data points
   */
  async insertVitalSigns(
    recordId: string,
    vitals: {
      systolic_bp?: number;
      diastolic_bp?: number;
      heart_rate?: number;
      temperature?: number;
      respiratory_rate?: number;
      oxygen_saturation?: number;
    }
  ): Promise<AtomicDataInsertResponse> {
    // Filter out undefined values
    const fields = Object.entries(vitals)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {});

    return this.insertAtomicData(recordId, fields);
  }

  /**
   * Insert lab results as atomic data points
   */
  async insertLabResults(
    recordId: string,
    labResults: {
      glucose?: number;
      cholesterol?: number;
      hemoglobin?: number;
      white_blood_cell_count?: number;
      creatinine?: number;
      [key: string]: string | number | undefined;
    }
  ): Promise<AtomicDataInsertResponse> {
    // Filter out undefined values
    const fields = Object.entries(labResults)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {});

    return this.insertAtomicData(recordId, fields);
  }
}

export const atomicDataAPIService = AtomicDataAPIService.getInstance();
