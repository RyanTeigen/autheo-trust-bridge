import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Thermometer, Activity, Droplets, Scale } from 'lucide-react';

interface VitalSigns {
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  temperature: string;
  weight: string;
  notes: string;
}

const VitalSignsEntry: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vitals, setVitals] = useState<VitalSigns>({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    notes: ''
  });

  const handleInputChange = (field: keyof VitalSigns, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const entries = [];
      
      // Blood Pressure
      if (vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) {
        entries.push({
          owner_id: user.id,
          data_type: 'blood_pressure',
          enc_value: btoa(`${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}`),
          unit: 'mmHg',
          metadata: { source: 'manual_entry', notes: vitals.notes }
        });
      }
      
      // Heart Rate
      if (vitals.heartRate) {
        entries.push({
          owner_id: user.id,
          data_type: 'heart_rate',
          enc_value: btoa(vitals.heartRate),
          unit: 'bpm',
          metadata: { source: 'manual_entry', notes: vitals.notes }
        });
      }
      
      // Temperature
      if (vitals.temperature) {
        entries.push({
          owner_id: user.id,
          data_type: 'temperature',
          enc_value: btoa(vitals.temperature),
          unit: '°F',
          metadata: { source: 'manual_entry', notes: vitals.notes }
        });
      }
      
      // Weight
      if (vitals.weight) {
        entries.push({
          owner_id: user.id,
          data_type: 'weight',
          enc_value: btoa(vitals.weight),
          unit: 'lbs',
          metadata: { source: 'manual_entry', notes: vitals.notes }
        });
      }

      if (entries.length === 0) {
        toast({
          title: "No Data Entered",
          description: "Please enter at least one vital sign measurement.",
          variant: "destructive"
        });
        return;
      }

      // Insert all entries
      const { error } = await supabase
        .from('atomic_data_points')
        .insert(entries);

      if (error) throw error;

      toast({
        title: "Vitals Recorded",
        description: `Successfully recorded ${entries.length} vital sign measurement(s).`,
      });

      // Reset form
      setVitals({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        temperature: '',
        weight: '',
        notes: ''
      });

    } catch (error) {
      console.error('Error saving vitals:', error);
      toast({
        title: "Error",
        description: "Failed to save vital signs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Record Vital Signs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Blood Pressure */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="systolic" className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Systolic (mmHg)
            </Label>
            <Input
              id="systolic"
              type="number"
              placeholder="120"
              value={vitals.bloodPressureSystolic}
              onChange={(e) => handleInputChange('bloodPressureSystolic', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
            <Input
              id="diastolic"
              type="number"
              placeholder="80"
              value={vitals.bloodPressureDiastolic}
              onChange={(e) => handleInputChange('bloodPressureDiastolic', e.target.value)}
            />
          </div>
        </div>

        {/* Heart Rate */}
        <div>
          <Label htmlFor="heartRate" className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Heart Rate (bpm)
          </Label>
          <Input
            id="heartRate"
            type="number"
            placeholder="72"
            value={vitals.heartRate}
            onChange={(e) => handleInputChange('heartRate', e.target.value)}
          />
        </div>

        {/* Temperature */}
        <div>
          <Label htmlFor="temperature" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-primary" />
            Temperature (°F)
          </Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            placeholder="98.6"
            value={vitals.temperature}
            onChange={(e) => handleInputChange('temperature', e.target.value)}
          />
        </div>

        {/* Weight */}
        <div>
          <Label htmlFor="weight" className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            Weight (lbs)
          </Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="150"
            value={vitals.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            placeholder="Any additional notes..."
            value={vitals.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Recording...' : 'Record Vital Signs'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VitalSignsEntry;