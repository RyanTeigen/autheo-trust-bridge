
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
import { glucoseSchema, GlucoseFormData } from './schemas';
import { getGlucoseStatus } from './statusUtils';

interface GlucoseInputFormProps {
  onSuccess?: () => void;
}

const GlucoseInputForm: React.FC<GlucoseInputFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { insertGlucoseData } = useAtomicDataAPI();

  const glucoseForm = useForm<GlucoseFormData>({
    resolver: zodResolver(glucoseSchema),
    defaultValues: {
      recordedAt: new Date().toISOString().slice(0, 16),
      mealTiming: 'fasting'
    }
  });

  const glucose = glucoseForm.watch('glucose');
  const mealTiming = glucoseForm.watch('mealTiming');

  const onSubmit = async (data: GlucoseFormData) => {
    setLoading(true);
    try {
      const recordId = crypto.randomUUID();
      
      const result = await insertGlucoseData(recordId, {
        glucose: data.glucose,
        meal_timing: data.mealTiming
      });

      if (result.success) {
        toast({
          title: "Glucose Level Recorded",
          description: `Your ${data.mealTiming.replace('_', ' ')} glucose reading has been successfully recorded.`,
        });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error recording glucose:', error);
      toast({
        title: "Error",
        description: "Failed to record glucose level. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const glucoseStatus = getGlucoseStatus(glucose, mealTiming);

  return (
    <form onSubmit={glucoseForm.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="glucose">Blood Glucose (mg/dL)</Label>
          <Input
            id="glucose"
            type="number"
            placeholder="100"
            {...glucoseForm.register('glucose', { valueAsNumber: true })}
          />
          {glucoseForm.formState.errors.glucose && (
            <p className="text-sm text-red-500">{glucoseForm.formState.errors.glucose.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mealTiming">Meal Timing</Label>
          <Select 
            onValueChange={(value) => glucoseForm.setValue('mealTiming', value as any)}
            defaultValue="fasting"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fasting">Fasting</SelectItem>
              <SelectItem value="before_meal">Before Meal</SelectItem>
              <SelectItem value="after_meal">After Meal</SelectItem>
              <SelectItem value="2hr_post_meal">2 Hours Post-Meal</SelectItem>
              <SelectItem value="bedtime">Bedtime</SelectItem>
              <SelectItem value="random">Random</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {glucoseStatus && (
        <div className={`text-xs px-3 py-2 rounded-lg ${
          glucoseStatus.color === 'green' ? 'bg-green-100 text-green-800' :
          glucoseStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
          glucoseStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          <div className="font-medium">{glucoseStatus.message}</div>
          <div className="text-xs mt-1">
            {mealTiming === 'fasting' && 'Normal fasting: 70-99 mg/dL'}
            {mealTiming === '2hr_post_meal' && 'Normal 2hr post-meal: <140 mg/dL'}
            {!['fasting', '2hr_post_meal'].includes(mealTiming) && 'Normal range: 70-180 mg/dL'}
          </div>
        </div>
      )}

      {glucoseStatus && (glucoseStatus.status === 'low' || glucoseStatus.status === 'diabetic' || glucoseStatus.status === 'high') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {glucoseStatus.status === 'low' 
              ? 'Low blood sugar detected. Consider having a fast-acting carbohydrate and monitor closely.'
              : glucoseStatus.status === 'diabetic'
              ? 'Diabetic range detected. Follow your diabetes management plan and consult your healthcare provider.'
              : 'High blood sugar detected. Monitor closely and consider contacting your healthcare provider.'
            }
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="glucoseRecordedAt" className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          Date & Time
        </Label>
        <Input
          id="glucoseRecordedAt"
          type="datetime-local"
          {...glucoseForm.register('recordedAt')}
        />
        {glucoseForm.formState.errors.recordedAt && (
          <p className="text-sm text-red-500">{glucoseForm.formState.errors.recordedAt.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="glucoseNotes">Notes (Optional)</Label>
        <Input
          id="glucoseNotes"
          placeholder="Meal details, symptoms, or other notes..."
          {...glucoseForm.register('notes')}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Recording...' : 'Record Glucose Level'}
      </Button>
    </form>
  );
};

export default GlucoseInputForm;
