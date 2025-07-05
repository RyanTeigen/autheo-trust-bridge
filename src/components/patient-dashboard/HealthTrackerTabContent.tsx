
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Heart, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const HealthTrackerTabContent: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExistingRecords = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        // Only fetch existing medical records created by providers
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('patient_id', user.id)
          .not('provider_id', 'is', null); // Only records with provider_id
        
        if (error) {
          console.error('Error fetching records:', error);
        } else {
          setRecords(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingRecords();
  }, [user]);

  if (!user) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <Alert className="border-amber-500/30 bg-amber-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-slate-200">
              Please log in to access your health tracker.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-slate-300 mb-4">
            View your health metrics and vital signs data shared by healthcare providers.
          </p>
        </CardContent>
      </Card>

      {/* Display provider-created health records */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-autheo-primary"></div>
              <p className="text-center text-slate-300">Loading health records...</p>
            </div>
          ) : records.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium text-slate-200 mb-4">Your Health Records</h3>
              <div className="space-y-2">
                {records.map((record) => (
                  <div key={record.id} className="p-3 bg-slate-700 rounded-lg">
                    <p className="text-slate-200">{record.record_type}</p>
                    <p className="text-sm text-slate-400">
                      Created: {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Alert className="border-blue-500/30 bg-blue-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-slate-200">
                No health tracking records available. Contact your healthcare provider to set up health monitoring.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthTrackerTabContent;
