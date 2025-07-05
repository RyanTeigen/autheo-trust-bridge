
import React from 'react';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import HealthMetricsCard from './HealthMetricsCard';
import AtomicVitalsCard from '@/components/patient/AtomicVitalsCard';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Link } from 'lucide-react';

const ConsolidatedHealthOverview: React.FC = () => {
  const { healthRecords, healthMetrics } = useHealthRecords();
  
  // Mock compliance score for now
  const complianceScore = 92;
  
  return (
    <div className="space-y-6">
      {/* Integration Notice */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-autheo-primary flex items-center gap-2">
            <Link className="h-4 w-4" />
            Integrated Health Data
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-slate-400">
            Your health data is synchronized across all tabs. The vitals shown here are the same as those in your Health Tracker tab.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health metrics and vitals graphs */}
        <div className="lg:col-span-2 space-y-6">
          <HealthMetricsCard 
            metrics={healthMetrics} 
            healthRecords={healthRecords}
            complianceScore={complianceScore}
          />
          
        </div>
        
        {/* Atomic vitals card */}
        <div className="lg:col-span-1">
          <AtomicVitalsCard />
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedHealthOverview;
