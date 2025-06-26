
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import LineGraph from '@/components/charts/LineGraph';
import { fetchAndFormatVitals } from '@/utils/vitalsDataUtils';

interface VitalsData {
  glucose: Array<{ label: string; value: number }>;
  heartRate: Array<{ label: string; value: number }>;
  systolicBp: Array<{ label: string; value: number }>;
  diastolicBp: Array<{ label: string; value: number }>;
}

const VitalsMetrics: React.FC = () => {
  const { user } = useAuth();
  const [vitalsData, setVitalsData] = useState<VitalsData>({
    glucose: [],
    heartRate: [],
    systolicBp: [],
    diastolicBp: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVitalsData = async () => {
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const encryptionKey = localStorage.getItem('userEncryptionKey') || 
                           localStorage.getItem(`encryption_key_${user.id}`);

      if (!encryptionKey) {
        setError('Encryption key not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const [glucose, heartRate, systolicBp, diastolicBp] = await Promise.all([
          fetchAndFormatVitals('glucose', user.id, encryptionKey),
          fetchAndFormatVitals('heart_rate', user.id, encryptionKey),
          fetchAndFormatVitals('systolic_bp', user.id, encryptionKey),
          fetchAndFormatVitals('diastolic_bp', user.id, encryptionKey)
        ]);

        setVitalsData({
          glucose,
          heartRate,
          systolicBp,
          diastolicBp
        });
        setError(null);
      } catch (err) {
        console.error('Error loading vitals data:', err);
        setError('Failed to load vitals data');
      } finally {
        setLoading(false);
      }
    };

    loadVitalsData();
  }, [user]);

  const hasData = Object.values(vitalsData).some(data => data.length > 0);

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-autheo-primary">
            <Activity className="h-5 w-5" />
            Vitals Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-slate-700/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !hasData) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-autheo-primary">
            <Activity className="h-5 w-5" />
            Vitals Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {error || 'No vitals data available yet.'}
            </p>
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
          Vitals Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {vitalsData.glucose.length > 0 && (
            <LineGraph
              title="🧬 Glucose"
              data={vitalsData.glucose}
              color="#10B981"
              unit=" mg/dL"
              height={200}
            />
          )}
          
          {vitalsData.heartRate.length > 0 && (
            <LineGraph
              title="❤️ Heart Rate"
              data={vitalsData.heartRate}
              color="#EF4444"
              unit=" bpm"
              height={200}
            />
          )}
          
          {vitalsData.systolicBp.length > 0 && (
            <LineGraph
              title="💉 Systolic BP"
              data={vitalsData.systolicBp}
              color="#3B82F6"
              unit=" mmHg"
              height={200}
            />
          )}
          
          {vitalsData.diastolicBp.length > 0 && (
            <LineGraph
              title="💉 Diastolic BP"
              data={vitalsData.diastolicBp}
              color="#8B5CF6"
              unit=" mmHg"
              height={200}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VitalsMetrics;
