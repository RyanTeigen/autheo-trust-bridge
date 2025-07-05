
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Heart, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AtomicDataForm from '@/components/patient/AtomicDataForm';
import VitalsMetrics from '@/components/patient/vital-signs/VitalsMetrics';
import { useAuth } from '@/contexts/AuthContext';
import { getOrCreateMedicalRecord } from '@/utils/record';

const HealthTrackerTabContent: React.FC = () => {
  const { user } = useAuth();
  const [recordId, setRecordId] = useState<string | null>(null);
  const [recordLoading, setRecordLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrCreateRecord = async () => {
    if (!user?.id) {
      setRecordLoading(false);
      setError('Please log in to access your medical records.');
      return;
    }
    
    console.log('Fetching or creating medical record for user:', user.id);
    setError(null);
    setRecordLoading(true);
    
    try {
      const id = await getOrCreateMedicalRecord(user.id);
      
      if (id) {
        setRecordId(id);
        console.log('Successfully loaded medical record:', id);
      } else {
        setError('Failed to load or create medical record. This might be due to database permissions. Please try refreshing the page or contact support if the issue persists.');
      }
    } catch (err) {
      console.error('Error in fetchOrCreateRecord:', err);
      setError('An unexpected error occurred while loading your medical record. Please try again.');
    } finally {
      setRecordLoading(false);
    }
  };

  useEffect(() => {
    fetchOrCreateRecord();
  }, [user]);

  const handleRetry = () => {
    fetchOrCreateRecord();
  };

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
            Track your vital signs, view health metrics, and monitor your health trends over time.
          </p>
        </CardContent>
      </Card>

      {/* Vital Signs Input Section */}
      <div className="mb-6">
        {recordLoading ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-autheo-primary"></div>
                <p className="text-center text-slate-300">Loading your medical record...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Alert className="border-red-500/30 bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-slate-200 flex items-center justify-between">
              <span>{error}</span>
              <Button 
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        ) : recordId ? (
          <AtomicDataForm recordId={recordId} />
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <Alert className="border-amber-500/30 bg-amber-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-slate-200 flex items-center justify-between">
                  <span>No medical record found. Click to create one.</span>
                  <Button 
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="ml-4"
                  >
                    Create Record
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Health Metrics and Charts */}
      <VitalsMetrics />
    </div>
  );
};

export default HealthTrackerTabContent;
