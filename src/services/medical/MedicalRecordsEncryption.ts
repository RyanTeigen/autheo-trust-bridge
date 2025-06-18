
import { DecryptedMedicalRecord } from '@/types/medical';
import { encrypt, decrypt } from '../encryption/MedicalRecordsEncryption';

export class MedicalRecordsEncryption {
  static decryptRecords(records: any[]): DecryptedMedicalRecord[] {
    return records.map(record => this.decryptSingleRecord(record));
  }

  static decryptSingleRecord(record: any): DecryptedMedicalRecord {
    try {
      const decryptedData = decrypt(record.encrypted_data);
      return {
        id: record.id,
        patient_id: record.patient_id,
        data: JSON.parse(decryptedData),
        record_type: record.record_type || 'general',
        created_at: record.created_at,
        updated_at: record.updated_at
      };
    } catch (decryptError) {
      console.error('Error decrypting record:', decryptError);
      return {
        id: record.id,
        patient_id: record.patient_id,
        data: { error: 'Failed to decrypt record' },
        record_type: record.record_type || 'general',
        created_at: record.created_at,
        updated_at: record.updated_at
      };
    }
  }

  static encryptRecordData(data: any): string {
    return encrypt(JSON.stringify(data));
  }
}
