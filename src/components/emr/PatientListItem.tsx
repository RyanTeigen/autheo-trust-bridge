
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
      className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-md transition-colors border border-transparent hover:border-autheo-primary/10"
      role="button"
      aria-label={`Select patient ${patient.name}`}
    >
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-autheo-primary/20 flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-autheo-primary" />
        </div>
        <div>
          <p className="font-semibold text-base">{patient.name}</p>
          <div className="flex items-center text-xs text-muted-foreground space-x-2">
            <span className="whitespace-nowrap">DOB: {new Date(patient.dob).toLocaleDateString()}</span>
            <span className="px-1 text-autheo-primary">•</span>
            <span className="whitespace-nowrap">MRN: {patient.mrn}</span>
          </div>
        </div>
      </div>
      <Button 
        size="sm" 
        variant="autheo-outline"
        onClick={(e) => {
          e.stopPropagation();
          onSelectPatient(patient.id);
        }}
        className="ml-2 whitespace-nowrap"
      >
        Select
      </Button>
    </div>
  );
};

export default PatientListItem;
