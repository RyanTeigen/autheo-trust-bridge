
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PatientListItem from './PatientListItem';

interface Patient {
  id: string;
  name: string;
  dob: string;
  mrn: string;
}

interface PatientSearchResultsProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
}

const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({ patients, onSelectPatient }) => {
  if (patients.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-2">
        <div className="space-y-2">
          {patients.map((patient) => (
            <PatientListItem 
              key={patient.id}
              patient={patient}
              onSelectPatient={onSelectPatient}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientSearchResults;
