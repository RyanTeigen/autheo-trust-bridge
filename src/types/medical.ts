
export interface Patient {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  mrn?: string;
  allergies?: string[];
  emergency_contact?: string;
  insurance_info?: any;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  user_id?: string;
  patient_id: string;
  encrypted_data: string;
  iv?: string;
  record_type?: string;
  created_at: string;
  updated_at: string;
}

export interface SharingPermission {
  id: string;
  patient_id: string;
  grantee_id: string;
  medical_record_id: string;
  permission_type: 'read' | 'write';
  expires_at?: string;
  created_at: string;
}

export interface DecryptedRecord {
  id: string;
  patient_id: string;
  data: any;
  record_type: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    algorithm: string;
    timestamp: string;
    encrypted: boolean;
  };
}

// Alias for backward compatibility
export type DecryptedMedicalRecord = DecryptedRecord;
