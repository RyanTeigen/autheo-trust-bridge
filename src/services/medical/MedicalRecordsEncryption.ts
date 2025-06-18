
import { DecryptedMedicalRecord } from '@/types/medical';

export class MedicalRecordsEncryption {
  static decryptRecords(records: any[]): DecryptedMedicalRecord[] {
    return records.map(record => this.decryptSingleRecord(record));
  }

  static decryptSingleRecord(record: any): DecryptedMedicalRecord {
    try {
      // For now, just parse the JSON since it's stored as plain JSON
      // In production, you would decrypt the encrypted_data field
      const decryptedData = JSON.parse(record.encrypted_data);
      return {
        id: record.id,
        patient_id: record.patient_id,
        data: decryptedData,
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
    // For now, just stringify the data
    // In production, you would encrypt this data
    return JSON.stringify(data);
  }
}
