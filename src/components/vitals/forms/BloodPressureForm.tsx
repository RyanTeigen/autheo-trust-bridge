
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAtomicDataAPI } from '@/hooks/useAtomicDataAPI';
import { getVitalStatus } from '@/utils/clinicalReferences';

const bloodPressureSchema = z.object({
  systolic: z.number().min(50, 'Systolic must be at least 50').max(250, 'Systolic cannot exceed 250'),
  diastolic: z.number().min(30, 'Diastolic must be at least 30').max(150, 'Diastolic cannot exceed 150'),
  recordedAt: z.string().min(1, 'Date and time are required'),
  notes: z.string().optional()
}).refine((data) => data.systolic > data.diastolic, {
  message: "Systolic pressure must be higher than diastolic pressure",
  path: ["systolic"]
});

type BloodPressureFormData = z.infer<typeof bloodPressureSchema>;

interface BloodPressureFormProps {
  onSuccess?: () => void;
}

const BloodPressureForm: React.FC<BloodPressureFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { insertVitalSigns } = useAtomicDataAPI();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BloodPressureFormData>({
    resolver: zodResolver(bloodPressureSchema),
    defaultValues: {
      recordedAt: new Date().toISOString().slice(0, 16),
    }
  });

  const systolic = watch('systolic');
  const diastolic = watch('diastolic');

  const getSystolicStatus = () => {
    if (!systolic) return null;
    return getVitalStatus(systolic, 'systolic_bp');
  };

  const getDiastolicStatus = () => {
    if (!diastolic) return null;
    return getVitalStatus(diastolic, 'diastolic_bp');
  };

  const onSubmit = async (data: BloodPressureFormData) => {
    setLoading(true);
    try {
      // Create a temporary record ID for this vital signs entry
      const recordId = crypto.randomUUID();
      
      const result = await insertVitalSigns(recordId, {
        systolic_bp: data.systolic,
        diastolic_bp: data.diastolic
      });

      if (result.success) {
        toast({
          title: "Blood Pressure Recorded",
          description: "Your blood pressure has been successfully recorded.",
        });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error recording blood pressure:', error);
      toast({
        title: "Error",
        description: "Failed to record blood pressure. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const systolicStatus = getSystolicStatus();
  const diastolicStatus = getDiastolicStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          Blood Pressure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic">Systolic (mmHg)</Label>
              <Input
                id="systolic"
                type="number"
                placeholder="120"
                {...register('systolic', { valueAsNumber: true })}
              />
              {errors.systolic && (
                <p className="text-sm text-red-500">{errors.systolic.message}</p>
              )}
              {systolicStatus && (
                <div className={`text-xs px-2 py-1 rounded ${
                  systolicStatus.status === 'normal' ? 'bg-green-100 text-green-800' :
                  systolicStatus.status === 'borderline' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {systolicStatus.range.label}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
              <Input
                id="diastolic"
                type="number"
                placeholder="80"
                {...register('diastolic', { valueAsNumber: true })}
              />
              {errors.diastolic && (
                <p className="text-sm text-red-500">{errors.diastolic.message}</p>
              )}
              {diastolicStatus && (
                <div className={`text-xs px-2 py-1 rounded ${
                  diastolicStatus.status === 'normal' ? 'bg-green-100 text-green-800' :
                  diastolicStatus.status === 'borderline' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {diastolicStatus.range.label}
                </div>
              )}
            </div>
          </div>

          {(systolicStatus?.status === 'high' || diastolicStatus?.status === 'high') && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                High blood pressure detected. Consider consulting with your healthcare provider.
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
            {loading ? 'Recording...' : 'Record Blood Pressure'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BloodPressureForm;
