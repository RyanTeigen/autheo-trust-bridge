
import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  HealthRecord,
  Medication,
  Diagnosis,
  Immunization,
  MedicalTest,
  Allergy,
  HealthMetrics,
  HealthRecordsSummary,
  HealthRecordsContextType
} from './health-records/types';
import {
  mockHealthRecords,
  mockMedications,
  mockDiagnoses,
  mockImmunizations,
  mockMedicalTests,
  mockAllergies,
  mockHealthMetrics,
  recentHealthRecords
} from './health-records/mockData';
import {
  calculateSummary,
  getRecordsByCategory as utilGetRecordsByCategory,
  getRecordsByFilter as utilGetRecordsByFilter
} from './health-records/utils';

// Re-export types for backward compatibility
export type {
  HealthRecord,
  Medication,
  Diagnosis,
  Immunization,
  MedicalTest,
  Allergy,
  HealthMetrics,
  HealthRecordsSummary
};

const HealthRecordsContext = createContext<HealthRecordsContextType | undefined>(undefined);

export const HealthRecordsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<HealthRecord[]>(mockHealthRecords);
  const [meds, setMeds] = useState<Medication[]>(mockMedications);
  const [diags, setDiags] = useState<Diagnosis[]>(mockDiagnoses);
  const [immunizations, setImmunizations] = useState<Immunization[]>(mockImmunizations);
  const [tests, setTests] = useState<MedicalTest[]>(mockMedicalTests);
  const [allergies, setAllergies] = useState<Allergy[]>(mockAllergies);
  const [metrics, setMetrics] = useState<HealthMetrics[]>(mockHealthMetrics);
  
  // Calculate summary statistics
  const summary: HealthRecordsSummary = React.useMemo(() => {
    return calculateSummary(records);
  }, [records]);

  // Function to toggle record sharing status
  const toggleRecordSharing = (id: string, shared: boolean) => {
    setRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === id ? { ...record, isShared: shared } : record
      )
    );
  };

  // Alias for toggleRecordSharing to match the expected interface
  const toggleShare = (id: string, shared: boolean) => {
    toggleRecordSharing(id, shared);
  };

  // Function to share health info (placeholder implementation)
  const shareHealthInfo = () => {
    console.log('Sharing health information...');
    // This could trigger a dialog or perform an action to share health info
  };

  // Function to get records by category
  const getRecordsByCategory = (category: string) => {
    return utilGetRecordsByCategory(records, category);
  };

  // Function to filter records
  const getRecordsByFilter = (filter: 'all' | 'shared' | 'private' | 'recent') => {
    return utilGetRecordsByFilter(records, filter);
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
    toggleShare,
    shareHealthInfo,
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
