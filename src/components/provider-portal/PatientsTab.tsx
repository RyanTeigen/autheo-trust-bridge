
import React from 'react';
import AdvancedPatientSearch, { PatientRecord } from '@/components/emr/AdvancedPatientSearch';

interface PatientsTabProps {
  patientRecords: PatientRecord[];
}

const PatientsTab: React.FC<PatientsTabProps> = ({ patientRecords }) => {
  console.log('PatientsTab rendering with records:', patientRecords.length);

  return (
    <div className="space-y-6 bg-slate-900 text-slate-100">
      <div className="flex flex-col space-y-2">
        <h3 className="text-2xl font-semibold">Patient Records</h3>
        <p className="text-slate-400">Search and manage patient records</p>
      </div>
      
      <AdvancedPatientSearch 
        patients={patientRecords}
        onSelectPatient={(patient) => {
          console.log('Selected patient:', patient);
        }}
      />
    </div>
  );
};

export default PatientsTab;
