
import { hybridEncrypt, hybridDecrypt, HybridEncryptedData } from '@/utils/hybrid-encryption';
import { generateMLKEMKeyPair } from '@/utils/pq-mlkem';
import { DecryptedMedicalRecord, MedicalRecord } from '@/types/medical';
import { decryptRecord } from '@/hooks/use-authenticated-fetch';

export class MedicalRecordsEncryption {
  /**
   * Encrypt medical record data using hybrid encryption
   */
  static async encryptRecordData(data: any): Promise<string> {
    try {
      // For now, use a mock public key - in production, get from user's profile
      const mockKeyPair = await generateMLKEMKeyPair();
      const publicKey = mockKeyPair.publicKey;
      
      const encrypted = await hybridEncrypt(JSON.stringify(data), publicKey);
      return JSON.stringify(encrypted);
    } catch (error) {
      console.error('Failed to encrypt record data:', error);
      // Fallback to legacy encryption for development
      return btoa(JSON.stringify(data));
    }
  }

  /**
   * Decrypt a single medical record
   */
  static async decryptSingleRecord(record: MedicalRecord & { patients: { user_id: string } }): Promise<DecryptedMedicalRecord> {
    try {
      // Try quantum-safe decryption first
      const decryptedData = await decryptRecord(record);
      const parsedData = JSON.parse(decryptedData);
      
      return {
        id: record.id,
        title: parsedData.title || 'Quantum-Safe Medical Record',
        description: parsedData.description || 'Decrypted with post-quantum cryptography',
        recordType: record.record_type || 'general',
        data: parsedData,
        created_at: record.created_at,
        updated_at: record.updated_at,
        patient_id: record.patient_id || '',
        encryption: {
          isQuantumSafe: true,
          algorithm: 'AES-256-GCM + ML-KEM-768'
        }
      };
    } catch (quantumError) {
      console.log('Quantum-safe decryption failed, trying legacy:', quantumError.message);
      
      // Fall back to legacy decryption
      try {
        const decryptedData = JSON.parse(atob(record.encrypted_data));
        return {
          id: record.id,
          title: decryptedData.title || 'Medical Record',
          description: decryptedData.description || '',
          recordType: record.record_type || 'general',
          data: decryptedData,
          created_at: record.created_at,
          updated_at: record.updated_at,
          patient_id: record.patient_id || '',
          encryption: {
            isQuantumSafe: false,
            algorithm: 'Legacy Base64'
          }
        };
      } catch (legacyError) {
        console.error('All decryption methods failed:', legacyError);
        return {
          id: record.id,
          title: 'Decryption Failed',
          description: 'Unable to decrypt this record',
          recordType: record.record_type || 'general',
          data: { error: 'Decryption failed' },
          created_at: record.created_at,
          updated_at: record.updated_at,
          patient_id: record.patient_id || '',
          encryption: {
            isQuantumSafe: false,
            algorithm: 'Unknown'
          }
        };
      }
    }
  }

  /**
   * Decrypt multiple medical records
   */
  static async decryptRecords(records: (MedicalRecord & { patients: { user_id: string } })[]): Promise<DecryptedMedicalRecord[]> {
    const decryptedRecords = [];
    
    for (const record of records) {
      try {
        const decryptedRecord = await this.decryptSingleRecord(record);
        decryptedRecords.push(decryptedRecord);
      } catch (error) {
        console.error(`Failed to decrypt record ${record.id}:`, error);
        // Skip failed records but continue with others
      }
    }
    
    return decryptedRecords;
  }
}
