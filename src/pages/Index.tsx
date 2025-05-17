
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/dashboard/PageHeader';
import KeyMetrics from '@/components/dashboard/KeyMetrics';
import QuickActions from '@/components/dashboard/QuickActions';
import HealthRecordsSummary from '@/components/dashboard/HealthRecordsSummary';
import ApprovedAccess from '@/components/dashboard/ApprovedAccess';

const Index = () => {
  const { toast } = useToast();

  // Mock health records count
  const healthRecords = {
    total: 17,
    shared: 5,
    pending: 2
  };

  // Mock compliance score
  const complianceScore = 92;

  // Mock recent health records
  const recentRecords = [
    { title: "Annual Physical", provider: "Dr. Emily Chen", date: "05/10/2025" },
    { title: "Blood Test Results", provider: "Metro Lab", date: "05/02/2025" },
    { title: "Vaccination Record", provider: "City Health Clinic", date: "04/22/2025" }
  ];

  // Mock providers with access
  const providersWithAccess = [
    { name: "Dr. Emily Chen", role: "Primary Care", accessLevel: "Full Access" },
    { name: "Dr. James Wilson", role: "Cardiology", accessLevel: "Limited Access" },
    { name: "Metro General Hospital", role: "Emergency", accessLevel: "Temporary Access" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Health Dashboard" 
        description="Securely manage and share your health records"
      />
      
      <KeyMetrics healthRecords={healthRecords} complianceScore={complianceScore} />
      
      <QuickActions />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthRecordsSummary records={recentRecords} />
        <ApprovedAccess providers={providersWithAccess} />
      </div>
    </div>
  );
};

export default Index;
