
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  dob: string;
  mrn: string;
}

interface PatientListItemProps {
  patient: Patient;
  onSelectPatient: (patientId: string) => void;
}

const PatientListItem: React.FC<PatientListItemProps> = ({ patient, onSelectPatient }) => {
  return (
    <div 
      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md transition-colors"
      onClick={() => onSelectPatient(patient.id)}
    >
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-autheo-primary/20 flex items-center justify-center">
          <User className="h-5 w-5 text-autheo-primary" />
        </div>
        <div>
          <p className="font-medium text-base">{patient.name}</p>
          <div className="flex items-center text-xs text-muted-foreground space-x-1">
            <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
            <span className="px-1">•</span>
            <span>MRN: {patient.mrn}</span>
          </div>
        </div>
      </div>
      <Button size="sm" variant="autheo-outline">Select</Button>
    </div>
  );
};

export default PatientListItem;
