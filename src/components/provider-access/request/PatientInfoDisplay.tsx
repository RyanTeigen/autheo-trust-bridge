
import React from 'react';
import { PatientInfo } from './PatientSearch';

interface PatientInfoDisplayProps {
  patientInfo: PatientInfo;
}

const PatientInfoDisplay: React.FC<PatientInfoDisplayProps> = ({ patientInfo }) => {
  return (
    <div className="bg-slate-700/50 p-4 rounded-md">
      <h3 className="font-medium text-slate-100 mb-1">Patient Information</h3>
      <p className="text-slate-300">{patientInfo.name}</p>
      <p className="text-slate-400 text-sm">ID: {patientInfo.id}</p>
      {patientInfo.email && (
        <p className="text-slate-400 text-sm">Email: {patientInfo.email}</p>
      )}
    </div>
  );
};

export default PatientInfoDisplay;
