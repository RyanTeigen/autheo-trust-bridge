
import {
  HealthRecord,
  Medication,
  Diagnosis,
  Immunization,
  MedicalTest,
  Allergy,
  HealthMetrics
} from './types';

export const mockHealthRecords: HealthRecord[] = [
  {
    id: '1',
    title: 'Hypertension Diagnosis',
    date: '2024-01-15',
    provider: 'Dr. Emily Chen',
    category: 'condition',
    details: 'Essential (primary) hypertension. Blood pressure reading: 145/92.',
    isShared: false
  },
  {
    id: '2',
    title: 'Complete Blood Count',
    date: '2023-11-02',
    provider: 'Aurora Advocate Lab',
    category: 'lab',
    details: 'WBC: 6.2, RBC: 4.8, Hemoglobin: 14.2, Hematocrit: 42.1%, Platelets: 250',
    isShared: true
  },
  {
    id: '3',
    title: 'Chest X-Ray',
    date: '2023-09-18',
    provider: 'Radiology Partners',
    category: 'imaging',
    details: 'No acute cardiopulmonary process. Heart size and pulmonary vascularity are within normal limits.',
    isShared: false
  },
  {
    id: '4',
    title: 'Lisinopril 10mg',
    date: '2024-01-15',
    provider: 'Dr. Emily Chen',
    category: 'medication',
    details: 'Take 1 tablet by mouth once daily. For hypertension management.',
    isShared: true
  },
  {
    id: '5',
    title: 'Annual Physical Exam',
    date: '2023-08-22',
    provider: 'Dr. James Wilson',
    category: 'visit',
    details: 'Routine annual physical examination. All vitals within normal range. Discussed preventive care.',
    isShared: false
  },
  {
    id: '6',
    title: 'Progress Note',
    date: '2024-02-10',
    provider: 'Dr. Emily Chen',
    category: 'note',
    details: 'Follow-up for hypertension. Patient reports good medication compliance. Blood pressure improved to 132/85.',
    isShared: false
  }
];

export const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Daily',
    startDate: '2025-04-01',
    refillDate: '2025-06-01',
    prescribedBy: 'Dr. Emily Chen'
  },
  {
    id: '2',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily at bedtime',
    startDate: '2025-03-15',
    refillDate: '2025-05-20',
    prescribedBy: 'Dr. James Wilson'
  },
  {
    id: '3',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily with meals',
    startDate: '2025-02-10',
    refillDate: '2025-05-10',
    prescribedBy: 'Dr. Emily Chen'
  }
];

export const mockDiagnoses: Diagnosis[] = [
  {
    id: '1',
    condition: 'Hypertension',
    diagnosedDate: '2024-10-15',
    diagnosedBy: 'Dr. Emily Chen',
    status: 'chronic',
    notes: 'Well-controlled with current medication'
  },
  {
    id: '2',
    condition: 'Type 2 Diabetes',
    diagnosedDate: '2024-09-05',
    diagnosedBy: 'Dr. James Wilson',
    status: 'active',
    notes: 'Currently managing with medication and lifestyle changes'
  },
  {
    id: '3',
    condition: 'Seasonal Allergies',
    diagnosedDate: '2023-04-20',
    diagnosedBy: 'Dr. Sarah Johnson',
    status: 'resolved'
  }
];

export const mockImmunizations: Immunization[] = [
  {
    id: '1',
    name: 'COVID-19 Vaccine',
    date: '2025-01-15',
    administeredBy: 'City Hospital Clinic',
    lotNumber: 'CV19-45789',
    nextDose: '2025-07-15'
  },
  {
    id: '2',
    name: 'Influenza Vaccine',
    date: '2024-10-20',
    administeredBy: 'Neighborhood Pharmacy',
    lotNumber: 'FLU-78965'
  },
  {
    id: '3',
    name: 'Tetanus Booster',
    date: '2022-06-10',
    administeredBy: 'Dr. Emily Chen',
    lotNumber: 'TET-12345',
    nextDose: '2032-06-10'
  }
];

export const mockMedicalTests: MedicalTest[] = [
  {
    id: '1',
    name: 'Complete Blood Count (CBC)',
    date: '2025-04-15',
    orderedBy: 'Dr. Emily Chen',
    results: 'All values within normal range',
    status: 'completed'
  },
  {
    id: '2',
    name: 'Lipid Panel',
    date: '2025-04-15',
    orderedBy: 'Dr. Emily Chen',
    results: 'LDL slightly elevated, other values normal',
    status: 'completed'
  },
  {
    id: '3',
    name: 'Chest X-Ray',
    date: '2025-05-10',
    orderedBy: 'Dr. James Wilson',
    status: 'pending'
  }
];

export const mockAllergies: Allergy[] = [
  {
    id: '1',
    name: 'Penicillin',
    severity: 'severe',
    reaction: 'Hives, difficulty breathing',
    diagnosed: '2023-05-15'
  },
  {
    id: '2',
    name: 'Peanuts',
    severity: 'moderate',
    reaction: 'Swelling, itchy throat',
    diagnosed: '2022-07-20'
  },
  {
    id: '3',
    name: 'Pollen',
    severity: 'mild',
    reaction: 'Sneezing, watery eyes',
    diagnosed: '2021-04-10'
  }
];

export const mockHealthMetrics: HealthMetrics[] = [
  { id: '1', name: 'Blood Pressure', value: '120/80', unit: 'mmHg', trend: 'stable', date: 'Today' },
  { id: '2', name: 'Heart Rate', value: '72', unit: 'bpm', trend: 'down', date: 'Today' },
  { id: '3', name: 'Blood Glucose', value: '95', unit: 'mg/dL', trend: 'up', date: 'Yesterday' },
  { id: '4', name: 'Weight', value: '155', unit: 'lbs', trend: 'stable', date: '2 days ago' }
];

export const recentHealthRecords = [
  { title: 'Annual Physical Results', provider: 'Dr. Emily Chen', date: 'May 5, 2025' },
  { title: 'Blood Work Analysis', provider: 'Metro Medical Lab', date: 'Apr 22, 2025' },
  { title: 'Cardiology Consultation', provider: 'Dr. James Wilson', date: 'Apr 15, 2025' }
];
