
import { ChecksumGenerator } from '@/services/security/checksumUtils';
import { supabase } from '@/integrations/supabase/client';

export interface RecordHashData {
  id: string;
  encrypted_data: string;
  record_type: string;
  created_at: string;
  updated_at?: string;
}

export class RecordHashingUtils {
  /**
   * Generate a SHA-256 hash for a medical record using the new hash-record edge function
   */
  public static async generateAndStoreRecordHash(
    recordId: string,
    payload: any,
    operation: string,
    patientId?: string,
    providerId?: string,
    signerId?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('hash-record', {
        body: {
          record_id: recordId,
          patient_id: patientId,
          provider_id: providerId,
          operation,
          signer_id: signerId,
          payload: payload
        }
      });

      if (error) {
        throw new Error(`Hash generation failed: ${error.message}`);
      }

      return data.hash;
    } catch (error) {
      console.error('Failed to generate and store record hash:', error);
      throw error;
    }
  }

  /**
   * Generate a SHA-256 hash for a medical record (legacy method)
   */
  public static async generateRecordHash(recordData: RecordHashData): Promise<string> {
    const hashInput = JSON.stringify({
      id: recordData.id,
      encrypted_data: recordData.encrypted_data,
      record_type: recordData.record_type,
      created_at: recordData.created_at,
      updated_at: recordData.updated_at
    });
    
    return await ChecksumGenerator.generateChecksum(hashInput);
  }

  /**
   * Verify a record hash matches the current record data
   */
  public static async verifyRecordHash(
    recordData: RecordHashData, 
    expectedHash: string
  ): Promise<boolean> {
    const currentHash = await this.generateRecordHash(recordData);
    return currentHash === expectedHash;
  }

  /**
   * Generate anchor transaction URL for Ethereum testnet
   */
  public static generateAnchorTxUrl(txHash: string): string {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }

  /**
   * Mock blockchain anchoring (for demonstration)
   * In production, this would integrate with actual blockchain
   */
  public static async mockBlockchainAnchor(recordHash: string): Promise<string> {
    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock transaction hash
    const timestamp = Date.now().toString();
    const mockTxHash = `0x${recordHash.substring(0, 8)}${timestamp.substring(-8)}`;
    
    return mockTxHash;
  }
}
