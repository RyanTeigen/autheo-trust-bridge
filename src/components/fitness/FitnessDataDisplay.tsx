
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity } from 'lucide-react';
import { useFitnessData } from '@/hooks/useFitnessData';
import { useFitnessAudit } from '@/hooks/useFitnessAudit';
import { useToast } from '@/hooks/use-toast';
import PrivacyControls from './components/PrivacyControls';
import ActivityCard from './components/ActivityCard';

const FitnessDataDisplay: React.FC = () => {
  const { fitnessData, loading, error } = useFitnessData();
  const { logDataAccess } = useFitnessAudit();
  const { toast } = useToast();
  const [showRawData, setShowRawData] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);

  // Log when fitness data is accessed
  useEffect(() => {
    if (fitnessData.length > 0) {
      logDataAccess('Viewed fitness data display', 'fitness_data_view', undefined, {
        data_count: fitnessData.length,
        privacy_mode: privacyMode
      });
    }
  }, [fitnessData, privacyMode]);

  const togglePrivacyMode = async () => {
    const newPrivacyMode = !privacyMode;
    setPrivacyMode(newPrivacyMode);
    
    // Log privacy mode change
    await logDataAccess(
      `Privacy mode ${newPrivacyMode ? 'enabled' : 'disabled'}`,
      'privacy_setting',
      'privacy_mode',
      { privacy_mode: newPrivacyMode }
    );
    
    toast({
      title: newPrivacyMode ? "Privacy Mode Enabled" : "Privacy Mode Disabled",
      description: newPrivacyMode 
        ? "Showing approximated values for privacy" 
        : "Showing actual fitness data values",
    });
  };

  const handleRawDataToggle = async () => {
    const newShowRawData = !showRawData;
    setShowRawData(newShowRawData);
    
    // Log raw data view toggle
    await logDataAccess(
      `Raw data view ${newShowRawData ? 'enabled' : 'disabled'}`,
      'raw_data_view',
      undefined,
      { show_raw_data: newShowRawData }
    );
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autheo-primary mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading fitness data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading fitness data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (fitnessData.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Fitness Data</h3>
            <p className="text-slate-400">
              Connect a fitness device and sync your data to see your activities here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PrivacyControls 
        privacyMode={privacyMode}
        onTogglePrivacyMode={togglePrivacyMode}
      />

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fitnessData.map((activity, index) => (
            <ActivityCard
              key={activity.id || index}
              activity={activity}
              privacyMode={privacyMode}
              showRawData={showRawData}
              onToggleRawData={handleRawDataToggle}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessDataDisplay;
