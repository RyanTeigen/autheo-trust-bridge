
// Standardized data model for health records
export interface HealthRecord {
  id: string;
  title: string;
  date: string;
  provider: string;
  category: 'medication' | 'condition' | 'lab' | 'imaging' | 'note' | 'visit' | 'immunization' | 'allergy';
  details: string;
  isShared: boolean;
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

export interface HealthMetrics {
  id?: string;
  name: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  date: string;
  highRange?: number;
  lowRange?: number;
  status?: string;
  statusColor?: string;
}

export interface HealthRecordsSummary {
  total: number;
  shared: number;
  pending: number;
  categories: Record<string, number>;
}

export interface HealthRecordsContextType {
  healthRecords: HealthRecord[];
  medications: Medication[];
  diagnoses: Diagnosis[];
  immunizations: Immunization[];
  medicalTests: MedicalTest[];
  allergies: Allergy[];
  healthMetrics: HealthMetrics[];
  summary: HealthRecordsSummary;
  recentHealthRecords: { title: string; provider: string; date: string }[];
  toggleRecordSharing: (id: string, shared: boolean) => void;
  toggleShare: (id: string, shared: boolean) => void;
  shareHealthInfo: () => void;
  getRecordsByCategory: (category: string) => HealthRecord[];
  getRecordsByFilter: (filter: 'all' | 'shared' | 'private' | 'recent') => HealthRecord[];
}
