
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface MedicalTerm {
  id: string;
  term: string;
  category: 'condition' | 'medication' | 'allergy' | 'procedure' | 'symptom';
  icd10?: string;
  description?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  category: string;
  fields: FormField[];
  conditions?: string[];
}

export interface FormField {
  name: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'number';
  label: string;
  required?: boolean;
  options?: string[];
  suggestions?: string[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface PatientHistory {
  conditions: string[];
  medications: string[];
  allergies: string[];
  procedures: string[];
  symptoms: string[];
}

interface SmartFormsContextType {
  getAutocompleteSuggestions: (field: string, value: string, category: string) => MedicalTerm[];
  getFormTemplate: (category: string, conditions?: string[]) => FormTemplate | null;
  saveFormProgress: (formId: string, data: any) => void;
  getFormProgress: (formId: string) => any;
  validateMedicalEntry: (value: string, category: string) => { isValid: boolean; warnings: string[] };
  patientHistory: PatientHistory;
  medicalTerms: MedicalTerm[];
}

const SmartFormsContext = createContext<SmartFormsContextType | undefined>(undefined);

// Sample medical terms database
const MEDICAL_TERMS: MedicalTerm[] = [
  { id: '1', term: 'Hypertension', category: 'condition', icd10: 'I10', description: 'High blood pressure' },
  { id: '2', term: 'Type 2 Diabetes', category: 'condition', icd10: 'E11', description: 'Diabetes mellitus type 2' },
  { id: '3', term: 'Lisinopril', category: 'medication', description: 'ACE inhibitor for blood pressure' },
  { id: '4', term: 'Metformin', category: 'medication', description: 'Medication for type 2 diabetes' },
  { id: '5', term: 'Penicillin', category: 'allergy', description: 'Common antibiotic allergy' },
  { id: '6', term: 'Shellfish', category: 'allergy', description: 'Food allergy' },
  { id: '7', term: 'Chest pain', category: 'symptom', description: 'Pain in chest area' },
  { id: '8', term: 'Shortness of breath', category: 'symptom', description: 'Difficulty breathing' },
  { id: '9', term: 'Appendectomy', category: 'procedure', description: 'Surgical removal of appendix' },
  { id: '10', term: 'Colonoscopy', category: 'procedure', description: 'Examination of colon' },
];

// Form templates based on conditions
const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'general-intake',
    name: 'General Patient Intake',
    category: 'intake',
    fields: [
      { name: 'chiefComplaint', type: 'text', label: 'Chief Complaint', required: true },
      { name: 'currentMedications', type: 'multiselect', label: 'Current Medications' },
      { name: 'allergies', type: 'multiselect', label: 'Known Allergies' },
      { name: 'medicalHistory', type: 'multiselect', label: 'Medical History' },
    ]
  },
  {
    id: 'diabetes-followup',
    name: 'Diabetes Follow-up',
    category: 'followup',
    conditions: ['Type 2 Diabetes', 'Type 1 Diabetes'],
    fields: [
      { name: 'bloodSugar', type: 'number', label: 'Current Blood Sugar (mg/dL)', validation: { min: 50, max: 500 } },
      { name: 'lastA1C', type: 'number', label: 'Last A1C (%)', validation: { min: 4, max: 15 } },
      { name: 'medicationCompliance', type: 'select', label: 'Medication Compliance', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { name: 'symptoms', type: 'multiselect', label: 'Current Symptoms' },
    ]
  },
  {
    id: 'hypertension-check',
    name: 'Hypertension Check',
    category: 'followup',
    conditions: ['Hypertension'],
    fields: [
      { name: 'systolicBP', type: 'number', label: 'Systolic BP', validation: { min: 60, max: 250 } },
      { name: 'diastolicBP', type: 'number', label: 'Diastolic BP', validation: { min: 40, max: 150 } },
      { name: 'medicationCompliance', type: 'select', label: 'Medication Compliance', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { name: 'symptoms', type: 'multiselect', label: 'Current Symptoms' },
    ]
  }
];

export const SmartFormsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [medicalTerms] = useState<MedicalTerm[]>(MEDICAL_TERMS);
  const [patientHistory, setPatientHistory] = useState<PatientHistory>({
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    medications: ['Lisinopril', 'Metformin'],
    allergies: ['Penicillin'],
    procedures: ['Colonoscopy'],
    symptoms: []
  });

  const getAutocompleteSuggestions = (field: string, value: string, category: string): MedicalTerm[] => {
    if (!value || value.length < 2) return [];
    
    const searchValue = value.toLowerCase();
    return medicalTerms
      .filter(term => 
        term.category === category && 
        term.term.toLowerCase().includes(searchValue)
      )
      .slice(0, 5);
  };

  const getFormTemplate = (category: string, conditions?: string[]): FormTemplate | null => {
    // If patient has specific conditions, try to get specialized template
    if (conditions && conditions.length > 0) {
      const specializedTemplate = FORM_TEMPLATES.find(template => 
        template.conditions && 
        template.conditions.some(condition => conditions.includes(condition))
      );
      if (specializedTemplate) return specializedTemplate;
    }
    
    // Fall back to general template
    return FORM_TEMPLATES.find(template => template.category === category) || null;
  };

  const saveFormProgress = (formId: string, data: any) => {
    try {
      localStorage.setItem(`form_progress_${formId}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving form progress:', error);
    }
  };

  const getFormProgress = (formId: string) => {
    try {
      const saved = localStorage.getItem(`form_progress_${formId}`);
      if (saved) {
        const { data, timestamp } = JSON.parse(saved);
        // Check if saved data is less than 24 hours old
        if (new Date().getTime() - new Date(timestamp).getTime() < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error loading form progress:', error);
    }
    return null;
  };

  const validateMedicalEntry = (value: string, category: string): { isValid: boolean; warnings: string[] } => {
    const warnings: string[] = [];
    
    // Check for drug interactions
    if (category === 'medication') {
      if (value.toLowerCase().includes('warfarin') && patientHistory.medications.some(med => 
        med.toLowerCase().includes('aspirin')
      )) {
        warnings.push('Potential interaction with existing aspirin therapy');
      }
    }
    
    // Check for allergy conflicts
    if (category === 'medication') {
      const allergyMatch = patientHistory.allergies.find(allergy => 
        value.toLowerCase().includes(allergy.toLowerCase())
      );
      if (allergyMatch) {
        warnings.push(`Patient has known allergy to ${allergyMatch}`);
      }
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  };

  return (
    <SmartFormsContext.Provider value={{
      getAutocompleteSuggestions,
      getFormTemplate,
      saveFormProgress,
      getFormProgress,
      validateMedicalEntry,
      patientHistory,
      medicalTerms
    }}>
      {children}
    </SmartFormsContext.Provider>
  );
};

export const useSmartForms = () => {
  const context = useContext(SmartFormsContext);
  if (context === undefined) {
    throw new Error('useSmartForms must be used within a SmartFormsProvider');
  }
  return context;
};
