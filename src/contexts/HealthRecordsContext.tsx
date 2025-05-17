
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  name: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  date: string;
}

export interface HealthRecordsSummary {
  total: number;
  shared: number;
  pending: number;
  categories: Record<string, number>;
}

interface HealthRecordsContextType {
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
  getRecordsByCategory: (category: string) => HealthRecord[];
  getRecordsByFilter: (filter: 'all' | 'shared' | 'private' | 'recent') => HealthRecord[];
}

const HealthRecordsContext = createContext<HealthRecordsContextType | undefined>(undefined);

// Mock data for the provider
const mockHealthRecords: HealthRecord[] = [
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

const mockMedications: Medication[] = [
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

const mockDiagnoses: Diagnosis[] = [
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

const mockImmunizations: Immunization[] = [
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

const mockMedicalTests: MedicalTest[] = [
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

const mockAllergies: Allergy[] = [
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

const mockHealthMetrics: HealthMetrics[] = [
  { name: 'Blood Pressure', value: '120/80', unit: 'mmHg', trend: 'stable', date: 'Today' },
  { name: 'Heart Rate', value: '72', unit: 'bpm', trend: 'down', date: 'Today' },
  { name: 'Blood Glucose', value: '95', unit: 'mg/dL', trend: 'up', date: 'Yesterday' },
  { name: 'Weight', value: '155', unit: 'lbs', trend: 'stable', date: '2 days ago' }
];

export const HealthRecordsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<HealthRecord[]>(mockHealthRecords);
  const [meds, setMeds] = useState<Medication[]>(mockMedications);
  const [diags, setDiags] = useState<Diagnosis[]>(mockDiagnoses);
  const [immunizations, setImmunizations] = useState<Immunization[]>(mockImmunizations);
  const [tests, setTests] = useState<MedicalTest[]>(mockMedicalTests);
  const [allergies, setAllergies] = useState<Allergy[]>(mockAllergies);
  const [metrics, setMetrics] = useState<HealthMetrics[]>(mockHealthMetrics);
  
  // Recent health records for the dashboard
  const recentHealthRecords = [
    { title: 'Annual Physical Results', provider: 'Dr. Emily Chen', date: 'May 5, 2025' },
    { title: 'Blood Work Analysis', provider: 'Metro Medical Lab', date: 'Apr 22, 2025' },
    { title: 'Cardiology Consultation', provider: 'Dr. James Wilson', date: 'Apr 15, 2025' }
  ];

  // Calculate summary statistics
  const summary: HealthRecordsSummary = React.useMemo(() => {
    const total = records.length;
    const shared = records.filter(r => r.isShared).length;
    const pending = 2; // Mock number for pending shared records
    
    const categories = records.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      shared,
      pending,
      categories
    };
  }, [records]);

  // Function to toggle record sharing status
  const toggleRecordSharing = (id: string, shared: boolean) => {
    setRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === id ? { ...record, isShared: shared } : record
      )
    );
  };

  // Function to get records by category
  const getRecordsByCategory = (category: string) => {
    if (category === 'all') return records;
    return records.filter(record => record.category === category);
  };

  // Function to filter records
  const getRecordsByFilter = (filter: 'all' | 'shared' | 'private' | 'recent') => {
    switch (filter) {
      case 'shared':
        return records.filter(record => record.isShared);
      case 'private':
        return records.filter(record => !record.isShared);
      case 'recent':
        return [...records]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
      case 'all':
      default:
        return records;
    }
  };

  const value = {
    healthRecords: records,
    medications: meds,
    diagnoses: diags,
    immunizations,
    medicalTests: tests,
    allergies,
    healthMetrics: metrics,
    summary,
    recentHealthRecords,
    toggleRecordSharing,
    getRecordsByCategory,
    getRecordsByFilter
  };

  return (
    <HealthRecordsContext.Provider value={value}>
      {children}
    </HealthRecordsContext.Provider>
  );
};

export const useHealthRecords = () => {
  const context = useContext(HealthRecordsContext);
  if (context === undefined) {
    throw new Error('useHealthRecords must be used within a HealthRecordsProvider');
  }
  return context;
};
