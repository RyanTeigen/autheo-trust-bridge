
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAtomicDataAPI } from '@/hooks/useAtomicDataAPI';
import { hba1cSchema, HbA1cFormData } from './schemas';
import { getHbA1cStatus } from './statusUtils';

interface HbA1cInputFormProps {
  onSuccess?: () => void;
}

const HbA1cInputForm: React.FC<HbA1cInputFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { insertGlucoseData } = useAtomicDataAPI();

  const hba1cForm = useForm<HbA1cFormData>({
    resolver: zodResolver(hba1cSchema),
    defaultValues: {
      recordedAt: new Date().toISOString().slice(0, 16),
      testType: 'home'
    }
  });

  const hba1c = hba1cForm.watch('hba1c');

  const onSubmit = async (data: HbA1cFormData) => {
    setLoading(true);
    try {
      const recordId = crypto.randomUUID();
      
      const result = await insertGlucoseData(recordId, {
        hba1c: data.hba1c,
        test_type: data.testType
      });

      if (result.success) {
        toast({
          title: "HbA1c Recorded",
          description: "Your HbA1c test result has been successfully recorded.",
        });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error recording HbA1c:', error);
      toast({
        title: "Error",
        description: "Failed to record HbA1c. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hba1cStatus = getHbA1cStatus(hba1c);

  return (
    <form onSubmit={hba1cForm.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hba1c">HbA1c (%)</Label>
          <Input
            id="hba1c"
            type="number"
            step="0.1"
            placeholder="5.7"
            {...hba1cForm.register('hba1c', { valueAsNumber: true })}
          />
          {hba1cForm.formState.errors.hba1c && (
            <p className="text-sm text-red-500">{hba1cForm.formState.errors.hba1c.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="testType">Test Type</Label>
          <Select 
            onValueChange={(value) => hba1cForm.setValue('testType', value as any)}
            defaultValue="home"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lab">Laboratory</SelectItem>
              <SelectItem value="home">Home Test</SelectItem>
              <SelectItem value="point_of_care">Point of Care</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hba1cStatus && (
        <div className={`text-xs px-3 py-2 rounded-lg ${
          hba1cStatus.color === 'green' ? 'bg-green-100 text-green-800' :
          hba1cStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
          hba1cStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          <div className="font-medium">{hba1cStatus.message}</div>
          <div className="text-xs mt-1">
            Normal: &lt;5.7% | Prediabetic: 5.7-6.4% | Diabetic: ≥6.5%
          </div>
        </div>
      )}

      {hba1cStatus && (hba1cStatus.status === 'diabetic_fair' || hba1cStatus.status === 'diabetic_poor') && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {hba1cStatus.status === 'diabetic_fair'
              ? 'HbA1c indicates fair diabetes control. Consider discussing treatment adjustments with your healthcare provider.'
              : 'HbA1c indicates poor diabetes control. It\'s important to work with your healthcare team to improve management.'
            }
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="hba1cRecordedAt" className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          Date & Time
        </Label>
        <Input
          id="hba1cRecordedAt"
          type="datetime-local"
          {...hba1cForm.register('recordedAt')}
        />
        {hba1cForm.formState.errors.recordedAt && (
          <p className="text-sm text-red-500">{hba1cForm.formState.errors.recordedAt.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hba1cNotes">Notes (Optional)</Label>
        <Input
          id="hba1cNotes"
          placeholder="Test location, doctor visit notes, etc..."
          {...hba1cForm.register('notes')}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Recording...' : 'Record HbA1c'}
      </Button>
    </form>
  );
};

export default HbA1cInputForm;
