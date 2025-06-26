
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wind, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAtomicDataAPI } from '@/hooks/useAtomicDataAPI';

const respiratoryRateSchema = z.object({
  respiratoryRate: z.number().min(8, 'Respiratory rate too low').max(40, 'Respiratory rate too high'),
  recordedAt: z.string().min(1, 'Date and time are required'),
  notes: z.string().optional()
});

type RespiratoryRateFormData = z.infer<typeof respiratoryRateSchema>;

interface RespiratoryRateFormProps {
  onSuccess?: () => void;
}

const RespiratoryRateForm: React.FC<RespiratoryRateFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { insertVitalSigns } = useAtomicDataAPI();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RespiratoryRateFormData>({
    resolver: zodResolver(respiratoryRateSchema),
    defaultValues: {
      recordedAt: new Date().toISOString().slice(0, 16),
    }
  });

  const respiratoryRate = watch('respiratoryRate');

  const getRespiratoryRateStatus = () => {
    if (!respiratoryRate) return null;
    
    if (respiratoryRate < 12) return { status: 'low', message: 'Low respiratory rate (bradypnea)' };
    if (respiratoryRate > 20) return { status: 'high', message: 'High respiratory rate (tachypnea)' };
    return { status: 'normal', message: 'Normal respiratory rate' };
  };

  const onSubmit = async (data: RespiratoryRateFormData) => {
    setLoading(true);
    try {
      const recordId = crypto.randomUUID();
      
      const result = await insertVitalSigns(recordId, {
        respiratory_rate: data.respiratoryRate
      });

      if (result.success) {
        toast({
          title: "Respiratory Rate Recorded",
          description: "Your respiratory rate has been successfully recorded.",
        });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error recording respiratory rate:', error);
      toast({
        title: "Error",
        description: "Failed to record respiratory rate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const respiratoryStatus = getRespiratoryRateStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-teal-500" />
          Respiratory Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min)</Label>
            <Input
              id="respiratoryRate"
              type="number"
              placeholder="16"
              {...register('respiratoryRate', { valueAsNumber: true })}
            />
            {errors.respiratoryRate && (
              <p className="text-sm text-red-500">{errors.respiratoryRate.message}</p>
            )}
            {respiratoryStatus && (
              <div className={`text-xs px-2 py-1 rounded ${
                respiratoryStatus.status === 'normal' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {respiratoryStatus.message}
              </div>
            )}
          </div>

          {respiratoryStatus && respiratoryStatus.status !== 'normal' && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {respiratoryStatus.status === 'high' 
                  ? 'Elevated respiratory rate may indicate distress, fever, or other conditions.'
                  : 'Low respiratory rate may indicate sedation or other medical conditions.'
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
            {loading ? 'Recording...' : 'Record Respiratory Rate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RespiratoryRateForm;
