
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAtomicDataAPI } from '@/hooks/useAtomicDataAPI';
import { Activity, Heart, Thermometer, Droplets, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AtomicDataFormProps {
  recordId: string;
}

interface VitalSigns {
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
}

const AtomicDataForm: React.FC<AtomicDataFormProps> = ({ recordId }) => {
  const { insertVitalSigns, loading } = useAtomicDataAPI();
  const [vitals, setVitals] = useState<VitalSigns>({});
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof VitalSigns, value: string) => {
    const numericValue = value === '' ? undefined : parseFloat(value);
    setVitals(prev => ({
      ...prev,
      [field]: numericValue
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Filter out undefined values
    const filteredVitals = Object.entries(vitals)
      .filter(([_, value]) => value !== undefined && !isNaN(value as number))
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {});

    if (Object.keys(filteredVitals).length === 0) {
      setError('Please enter at least one vital sign measurement');
      return;
    }

    console.log('Submitting vitals for record:', recordId, filteredVitals);
    
    try {
      const result = await insertVitalSigns(recordId, filteredVitals);
      
      if (result.success) {
        // Clear form on success
        setVitals({});
        console.log('Vitals submitted successfully');
      } else {
        console.error('Failed to submit vitals:', result.error);
        setError(result.error || 'Failed to record vital signs. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting vitals:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to record vital signs: ${errorMessage}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-autheo-primary" />
          Record Vital Signs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Blood Pressure */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Systolic BP (mmHg)
              </Label>
              <Input
                id="systolic"
                type="number"
                placeholder="120"
                value={vitals.systolic_bp || ''}
                onChange={(e) => handleInputChange('systolic_bp', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diastolic" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Diastolic BP (mmHg)
              </Label>
              <Input
                id="diastolic"
                type="number"
                placeholder="80"
                value={vitals.diastolic_bp || ''}
                onChange={(e) => handleInputChange('diastolic_bp', e.target.value)}
              />
            </div>
          </div>

          {/* Heart Rate */}
          <div className="space-y-2">
            <Label htmlFor="heartRate" className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Heart Rate (bpm)
            </Label>
            <Input
              id="heartRate"
              type="number"
              placeholder="70"
              value={vitals.heart_rate || ''}
              onChange={(e) => handleInputChange('heart_rate', e.target.value)}
            />
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              Temperature (°F)
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="98.6"
              value={vitals.temperature || ''}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
            />
          </div>

          {/* Respiratory Rate and Oxygen Saturation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="respiratoryRate" className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                Respiratory Rate
              </Label>
              <Input
                id="respiratoryRate"
                type="number"
                placeholder="16"
                value={vitals.respiratory_rate || ''}
                onChange={(e) => handleInputChange('respiratory_rate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oxygenSaturation" className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                Oxygen Sat (%)
              </Label>
              <Input
                id="oxygenSaturation"
                type="number"
                placeholder="98"
                value={vitals.oxygen_saturation || ''}
                onChange={(e) => handleInputChange('oxygen_saturation', e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Recording Vitals...' : 'Record Vital Signs'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AtomicDataForm;
