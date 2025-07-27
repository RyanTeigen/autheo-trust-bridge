import React from 'react';
import { FileText } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import MedicalRecordsManager from '@/components/medical/MedicalRecordsManager';

const MedicalRecordsDetailPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Records"
        description="Secure, encrypted storage for your personal medical information"
        icon={<FileText className="h-8 w-8 text-blue-600" />}
      />
      
      <MedicalRecordsManager />
    </div>
  );
};

export default MedicalRecordsDetailPage;