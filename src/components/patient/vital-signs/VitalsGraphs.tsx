
import React from 'react';
import LineGraph from '@/components/charts/LineGraph';
import { useAtomicVitalsGraph } from '@/hooks/useAtomicVitalsGraph';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

const VitalsGraphs: React.FC = () => {
  const { data: bpData, loading: bpLoading } = useAtomicVitalsGraph('systolic_bp');
  const { data: heartRateData, loading: hrLoading } = useAtomicVitalsGraph('heart_rate');
  const { data: tempData, loading: tempLoading } = useAtomicVitalsGraph('temperature');

  const hasData = bpData.length > 0 || heartRateData.length > 0 || tempData.length > 0;
  const isLoading = bpLoading || hrLoading || tempLoading;

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-autheo-primary">
            <Activity className="h-5 w-5" />
            Vitals Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-700/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-autheo-primary">
            <Activity className="h-5 w-5" />
            Vitals Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No trend data available yet.</p>
            <p className="text-sm text-slate-400 mt-1">
              Graphs will appear once you have multiple vital sign readings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-autheo-primary">
          <Activity className="h-5 w-5" />
          Vitals Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bpData.length > 0 && (
          <LineGraph
            title="Systolic Blood Pressure"
            data={bpData}
            color="#4A6BF5"
            unit=" mmHg"
            height={180}
          />
        )}
        
        {heartRateData.length > 0 && (
          <LineGraph
            title="Heart Rate"
            data={heartRateData}
            color="#EF4444"
            unit=" bpm"
            height={180}
          />
        )}
        
        {tempData.length > 0 && (
          <LineGraph
            title="Temperature"
            data={tempData}
            color="#F59E0B"
            unit="°F"
            height={180}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default VitalsGraphs;
