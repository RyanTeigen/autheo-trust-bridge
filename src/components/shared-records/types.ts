
export interface SharedRecord {
  id: string;
  recipientName: string;
  recipientType: 'provider' | 'organization' | 'caregiver';
  sharedDate: string;
  expiryDate: string;
  accessLevel: 'full' | 'limited' | 'read-only';
  status: 'active' | 'pending' | 'expired';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  refillDate: string;
  prescribedBy: string;
}

export interface Diagnosis {
  id: string;
  condition: string;
  diagnosedDate: string;
  diagnosedBy: string;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

export interface Immunization {
  id: string;
  name: string;
  date: string;
  administeredBy: string;
  lotNumber?: string;
  nextDose?: string;
}

export interface MedicalTest {
  id: string;
  name: string;
  date: string;
  orderedBy: string;
  results?: string;
  status: 'pending' | 'completed' | 'canceled';
}

export interface Allergy {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
  diagnosed: string;
}

export interface ShareFormValues {
  recipientName: string;
  recipientType: 'provider' | 'organization' | 'caregiver';
  expiryDate?: Date;
  accessLevel: 'full' | 'limited' | 'read-only';
  recordTypes: string[];
}
