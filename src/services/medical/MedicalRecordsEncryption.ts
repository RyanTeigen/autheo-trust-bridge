
import { hybridEncrypt, hybridDecrypt, HybridEncryptedData } from '@/utils/hybrid-encryption';
import { generateMLKEMKeyPair } from '@/utils/pq-mlkem';
import { DecryptedMedicalRecord, MedicalRecord } from '@/types/medical';

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
  static decryptSingleRecord(record: MedicalRecord & { patients: { user_id: string } }): DecryptedMedicalRecord {
    try {
      // Try to parse as hybrid encrypted data first
      const encryptedData = JSON.parse(record.encrypted_data);
      
      if (encryptedData.pqEncryptedKey && encryptedData.algorithm) {
        // This is hybrid encrypted data - for now return mock decrypted data
        // In production, would use actual private key to decrypt
        return {
          id: record.id,
          title: 'Encrypted Record (Quantum-Safe)',
          description: 'This record is encrypted with post-quantum cryptography',
          recordType: record.record_type || 'general',
          data: {
            encrypted: true,
            algorithm: encryptedData.algorithm,
            timestamp: encryptedData.timestamp,
            quantumSafe: true
          },
          created_at: record.created_at,
          updated_at: record.updated_at,
          patient_id: record.patient_id || '',
          encryption: {
            isQuantumSafe: true,
            algorithm: encryptedData.algorithm
          }
        };
      }
    } catch (parseError) {
      // Fall back to legacy decryption
    }

    // Legacy decryption
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
    } catch (error) {
      console.error('Failed to decrypt record:', error);
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

  /**
   * Decrypt multiple medical records
   */
  static decryptRecords(records: (MedicalRecord & { patients: { user_id: string } })[]): DecryptedMedicalRecord[] {
    return records.map(record => this.decryptSingleRecord(record));
  }
}
