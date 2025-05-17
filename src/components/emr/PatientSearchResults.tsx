
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PatientListItem from './PatientListItem';
import { CircleDashed } from 'lucide-react';

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
    <Card className="shadow-sm border-autheo-primary/10 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-autheo-primary/5 to-transparent">
        <CardTitle className="text-base flex items-center">
          <CircleDashed className="h-4 w-4 mr-2 text-autheo-primary" />
          Patient Search Results
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
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
