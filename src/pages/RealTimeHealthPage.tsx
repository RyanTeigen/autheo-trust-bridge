import React from 'react';
import { Activity } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import RealTimeHealthMonitoring from '@/components/patient/RealTimeHealthMonitoring';

const RealTimeHealthPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Real-Time Health Monitoring"
        description="Continuous monitoring of vital signs and health metrics"
        icon={<Activity className="h-8 w-8 text-red-600" />}
      />
      
      <RealTimeHealthMonitoring />
    </div>
  );
};

export default RealTimeHealthPage;