
import React, { useState } from 'react';
import PatientSearchForm from './PatientSearchForm';
import PatientSearchResults from './PatientSearchResults';

// Mock patient data
const mockPatients = [
  { id: "P12345", name: "John Doe", dob: "1980-05-15", mrn: "MR-123456" },
  { id: "P23456", name: "Jane Smith", dob: "1975-08-22", mrn: "MR-234567" },
  { id: "P34567", name: "Robert Johnson", dob: "1990-11-10", mrn: "MR-345678" },
  { id: "P45678", name: "Emily Wilson", dob: "1985-03-30", mrn: "MR-456789" },
  { id: "P56789", name: "Michael Brown", dob: "1968-07-17", mrn: "MR-567890" },
];

interface PatientSearchProps {
  onSelectPatient: (patientId: string) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onSelectPatient }) => {
  const [searchResults, setSearchResults] = useState<typeof mockPatients>([]);
  
  return (
    <div className="space-y-4">
      <PatientSearchForm 
        onSearch={setSearchResults}
        patients={mockPatients}
      />
      
      <PatientSearchResults 
        patients={searchResults}
        onSelectPatient={onSelectPatient}
      />
    </div>
  );
};

export default PatientSearch;
