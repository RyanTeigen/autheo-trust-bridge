
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droplets, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAtomicDataAPI } from '@/hooks/useAtomicDataAPI';

const oxygenSaturationSchema = z.object({
  oxygenSaturation: z.number().min(70, 'Oxygen saturation too low').max(100, 'Oxygen saturation cannot exceed 100%'),
  recordedAt: z.string().min(1, 'Date and time are required'),
  notes: z.string().optional()
});

type OxygenSaturationFormData = z.infer<typeof oxygenSaturationSchema>;

interface OxygenSaturationFormProps {
  onSuccess?: () => void;
}

const OxygenSaturationForm: React.FC<OxygenSaturationFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { insertVitalSigns } = useAtomicDataAPI();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<OxygenSaturationFormData>({
    resolver: zodResolver(oxygenSaturationSchema),
    defaultValues: {
      recordedAt: new Date().toISOString().slice(0, 16),
    }
  });

  const oxygenSaturation = watch('oxygenSaturation');

  const getOxygenSaturationStatus = () => {
    if (!oxygenSaturation) return null;
    
    if (oxygenSaturation < 90) return { status: 'critical', message: 'Critical - Immediate medical attention needed' };
    if (oxygenSaturation < 95) return { status: 'low', message: 'Low oxygen saturation' };
    return { status: 'normal', message: 'Normal oxygen saturation' };
  };

  const onSubmit = async (data: OxygenSaturationFormData) => {
    setLoading(true);
    try {
      const recordId = crypto.randomUUID();
      
      const result = await insertVitalSigns(recordId, {
        oxygen_saturation: data.oxygenSaturation
      });

      if (result.success) {
        toast({
          title: "Oxygen Saturation Recorded",
          description: "Your oxygen saturation has been successfully recorded.",
        });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error recording oxygen saturation:', error);
      toast({
        title: "Error",
        description: "Failed to record oxygen saturation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const oxygenStatus = getOxygenSaturationStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          Oxygen Saturation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
            <Input
              id="oxygenSaturation"
              type="number"
              placeholder="98"
              {...register('oxygenSaturation', { valueAsNumber: true })}
            />
            {errors.oxygenSaturation && (
              <p className="text-sm text-red-500">{errors.oxygenSaturation.message}</p>
            )}
            {oxygenStatus && (
              <div className={`text-xs px-2 py-1 rounded ${
                oxygenStatus.status === 'normal' ? 'bg-green-100 text-green-800' :
                oxygenStatus.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {oxygenStatus.message}
              </div>
            )}
          </div>

          {oxygenStatus && oxygenStatus.status !== 'normal' && (
            <Alert className={`${
              oxygenStatus.status === 'critical' 
                ? 'border-red-200 bg-red-50' 
                : 'border-amber-200 bg-amber-50'
            }`}>
              <AlertTriangle className={`h-4 w-4 ${
                oxygenStatus.status === 'critical' ? 'text-red-600' : 'text-amber-600'
              }`} />
              <AlertDescription className={
                oxygenStatus.status === 'critical' ? 'text-red-800' : 'text-amber-800'
              }>
                {oxygenStatus.status === 'critical' 
                  ? 'Critical oxygen saturation level. Seek immediate medical attention.'
                  : 'Low oxygen saturation may indicate breathing difficulties or other conditions.'
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
            {loading ? 'Recording...' : 'Record Oxygen Saturation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OxygenSaturationForm;
