
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
      className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
      onClick={() => onSelectPatient(patient.id)}
    >
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-muted-foreground/20 flex items-center justify-center mr-2">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{patient.name}</p>
          <p className="text-xs text-muted-foreground">
            DOB: {new Date(patient.dob).toLocaleDateString()} | MRN: {patient.mrn}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm">View</Button>
    </div>
  );
};

export default PatientListItem;
