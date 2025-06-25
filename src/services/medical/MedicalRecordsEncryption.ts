
// services/medical/MedicalRecordsEncryption.ts
// Updated version using X25519 encryption

import { MedicalRecordsEncryption as NewEncryption } from '../encryption/MedicalRecordsEncryption';

// Re-export the new encryption service
export { MedicalRecordsEncryption } from '../encryption/MedicalRecordsEncryption';

// Legacy compatibility functions
export const encryptRecordData = NewEncryption.encryptMedicalRecord;
export const decryptSingleRecord = async (record: any) => {
  const { data: { user } } = await (await import('@/integrations/supabase/client')).supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const decryptedData = await NewEncryption.decryptMedicalRecord(
    record.encrypted_data,
    record.iv,
    user.id
  );
  
  return {
    ...record,
    data: decryptedData
  };
};
