
import React from 'react';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import HealthMetricsCard from './HealthMetricsCard';
import AtomicVitalsCard from '@/components/patient/AtomicVitalsCard';
import VitalsGraphs from '@/components/patient/vital-signs/VitalsGraphs';

const ConsolidatedHealthOverview: React.FC = () => {
  const { healthRecords, healthMetrics } = useHealthRecords();
  
  // Mock compliance score for now
  const complianceScore = 92;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Health metrics and atomic vitals */}
      <div className="lg:col-span-2 space-y-6">
        <HealthMetricsCard 
          metrics={healthMetrics} 
          healthRecords={healthRecords}
          complianceScore={complianceScore}
        />
        <VitalsGraphs />
      </div>
      
      {/* Atomic vitals card */}
      <div className="lg:col-span-1">
        <AtomicVitalsCard />
      </div>
    </div>
  );
};

export default ConsolidatedHealthOverview;
