
import React from 'react';
import { Heart } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { PatientRecordViewer } from '@/components/patient/PatientRecordViewer';

const PatientRecordsViewerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Medical Records"
        description="View and manage your personal medical records with secure encryption"
        icon={<Heart className="h-8 w-8 text-autheo-primary" />}
      />
      
      <PatientRecordViewer />
    </div>
  );
};

export default PatientRecordsViewerPage;
