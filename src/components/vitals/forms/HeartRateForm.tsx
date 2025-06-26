
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAtomicDataAPI } from '@/hooks/useAtomicDataAPI';
import { getVitalStatus } from '@/utils/clinicalReferences';

const heartRateSchema = z.object({
  heartRate: z.number().min(30, 'Heart rate must be at least 30').max(220, 'Heart rate cannot exceed 220'),
  recordedAt: z.string().min(1, 'Date and time are required'),
  notes: z.string().optional()
});

type HeartRateFormData = z.infer<typeof heartRateSchema>;

interface HeartRateFormProps {
  onSuccess?: () => void;
}

const HeartRateForm: React.FC<HeartRateFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { insertVitalSigns } = useAtomicDataAPI();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<HeartRateFormData>({
    resolver: zodResolver(heartRateSchema),
    defaultValues: {
      recordedAt: new Date().toISOString().slice(0, 16),
    }
  });

  const heartRate = watch('heartRate');

  const getHeartRateStatus = () => {
    if (!heartRate) return null;
    return getVitalStatus(heartRate, 'heart_rate');
  };

  const onSubmit = async (data: HeartRateFormData) => {
    setLoading(true);
    try {
      const recordId = crypto.randomUUID();
      
      const result = await insertVitalSigns(recordId, {
        heart_rate: data.heartRate
      });

      if (result.success) {
        toast({
          title: "Heart Rate Recorded",
          description: "Your heart rate has been successfully recorded.",
        });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error recording heart rate:', error);
      toast({
        title: "Error",
        description: "Failed to record heart rate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const heartRateStatus = getHeartRateStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500" />
          Heart Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <Input
              id="heartRate"
              type="number"
              placeholder="72"
              {...register('heartRate', { valueAsNumber: true })}
            />
            {errors.heartRate && (
              <p className="text-sm text-red-500">{errors.heartRate.message}</p>
            )}
            {heartRateStatus && (
              <div className={`text-xs px-2 py-1 rounded ${
                heartRateStatus.status === 'normal' ? 'bg-green-100 text-green-800' :
                heartRateStatus.status === 'high' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {heartRateStatus.range.label} - {heartRate} bpm
              </div>
            )}
          </div>

          {(heartRateStatus?.status === 'high' || heartRateStatus?.status === 'low') && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {heartRateStatus.status === 'high' 
                  ? 'Elevated heart rate detected. Consider monitoring or consulting with your healthcare provider.'
                  : 'Low heart rate detected. This may be normal for athletes or could indicate a medical condition.'
                }
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="recordedAt" className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Date & Time
            </Label>
            <Input
              id="recordedAt"
              type="datetime-local"
              {...register('recordedAt')}
            />
            {errors.recordedAt && (
              <p className="text-sm text-red-500">{errors.recordedAt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any relevant notes..."
              {...register('notes')}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Recording...' : 'Record Heart Rate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HeartRateForm;
