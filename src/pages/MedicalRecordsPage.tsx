
import React from 'react';
import { Shield } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import MedicalRecordsManager from '@/components/medical/MedicalRecordsManager';

const MedicalRecordsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Records"
        description="Secure, encrypted storage for your personal medical information"
        icon={<Shield className="h-8 w-8 text-blue-600" />}
      />
      
      <MedicalRecordsManager />
    </div>
  );
};

export default MedicalRecordsPage;
