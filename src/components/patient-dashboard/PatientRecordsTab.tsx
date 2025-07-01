
import React from 'react';
import { PatientRecordViewer } from '@/components/patient/PatientRecordViewer';

const PatientRecordsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <PatientRecordViewer />
    </div>
  );
};

export default PatientRecordsTab;
