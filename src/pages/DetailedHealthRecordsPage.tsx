
import React from 'react';
import DetailedHealthRecords from '@/components/records/DetailedHealthRecords';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Medication, Diagnosis, Immunization, MedicalTest, Allergy } from '@/contexts/HealthRecordsContext';

// Mock data for the detailed health records
const mockMedications: Medication[] = [
  {
    id: "med-001",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Daily",
    startDate: "2025-01-15",
    refillDate: "2025-06-15",
    prescribedBy: "Dr. Emily Chen"
  },
  {
    id: "med-002",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    startDate: "2025-02-10",
    refillDate: "2025-05-10",
    prescribedBy: "Dr. James Wilson"
  }
];

const mockDiagnoses: Diagnosis[] = [
  {
    id: "diag-001",
    condition: "Hypertension",
    diagnosedDate: "2024-11-12",
    diagnosedBy: "Dr. Emily Chen",
    status: "chronic",
    notes: "Well-controlled with current medication."
  },
  {
    id: "diag-002",
    condition: "Type 2 Diabetes",
    diagnosedDate: "2024-09-05",
    diagnosedBy: "Dr. James Wilson",
    status: "active",
    notes: "Monitoring blood glucose levels daily."
  }
];

const mockImmunizations: Immunization[] = [
  {
    id: "imm-001",
    name: "Influenza Vaccine",
    date: "2024-10-15",
    administeredBy: "Nurse Sarah Johnson",
    lotNumber: "FL-456789",
    nextDose: "2025-10-15"
  },
  {
    id: "imm-002",
    name: "COVID-19 Vaccine",
    date: "2024-06-20",
    administeredBy: "Dr. Michael Brown",
    lotNumber: "CV-789123"
  }
];

const mockMedicalTests: MedicalTest[] = [
  {
    id: "test-001",
    name: "Comprehensive Metabolic Panel",
    date: "2025-03-01",
    orderedBy: "Dr. Emily Chen",
    status: "completed",
    results: "All values within normal range."
  },
  {
    id: "test-002",
    name: "HbA1c",
    date: "2025-03-01",
    orderedBy: "Dr. James Wilson",
    status: "completed",
    results: "6.2% - Good glycemic control."
  },
  {
    id: "test-003",
    name: "Chest X-Ray",
    date: "2025-04-10",
    orderedBy: "Dr. Emily Chen",
    status: "pending"
  }
];

const mockAllergies: Allergy[] = [
  {
    id: "alg-001",
    name: "Penicillin",
    severity: "severe",
    reaction: "Hives, difficulty breathing",
    diagnosed: "2020-05-12"
  },
  {
    id: "alg-002",
    name: "Peanuts",
    severity: "moderate",
    reaction: "Skin rash, itching",
    diagnosed: "2019-03-24"
  }
];

const DetailedHealthRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Detailed Health Records</h1>
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        View your comprehensive health information, including medications, diagnoses, immunizations, and test results.
      </p>
      
      <DetailedHealthRecords 
        medications={mockMedications}
        diagnoses={mockDiagnoses}
        immunizations={mockImmunizations}
        medicalTests={mockMedicalTests}
        allergies={mockAllergies}
      />
    </div>
  );
};

export default DetailedHealthRecordsPage;
