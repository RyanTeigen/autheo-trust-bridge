
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Thermometer, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAtomicDataAPI } from '@/hooks/useAtomicDataAPI';

const temperatureSchema = z.object({
  temperature: z.number().min(90, 'Temperature too low').max(110, 'Temperature too high'),
  unit: z.enum(['fahrenheit', 'celsius']),
  recordedAt: z.string().min(1, 'Date and time are required'),
  notes: z.string().optional()
});

type TemperatureFormData = z.infer<typeof temperatureSchema>;

interface TemperatureFormProps {
  onSuccess?: () => void;
}

const TemperatureForm: React.FC<TemperatureFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { insertVitalSigns } = useAtomicDataAPI();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TemperatureFormData>({
    resolver: zodResolver(temperatureSchema),
    defaultValues: {
      unit: 'fahrenheit',
      recordedAt: new Date().toISOString().slice(0, 16),
    }
  });

  const temperature = watch('temperature');
  const unit = watch('unit');

  const convertToFahrenheit = (temp: number, fromUnit: string) => {
    if (fromUnit === 'celsius') {
      return (temp * 9/5) + 32;
    }
    return temp;
  };

  const getTemperatureStatus = () => {
    if (!temperature) return null;
    
    const tempF = convertToFahrenheit(temperature, unit);
    
    if (tempF < 97.0) return { status: 'low', message: 'Low temperature (hypothermia risk)' };
    if (tempF > 100.4) return { status: 'high', message: 'Fever detected' };
    if (tempF > 99.0) return { status: 'elevated', message: 'Slightly elevated' };
    return { status: 'normal', message: 'Normal temperature' };
  };

  const onSubmit = async (data: TemperatureFormData) => {
    setLoading(true);
    try {
      const recordId = crypto.randomUUID();
      const tempInF = convertToFahrenheit(data.temperature, data.unit);
      
      const result = await insertVitalSigns(recordId, {
        temperature: tempInF
      });

      if (result.success) {
        toast({
          title: "Temperature Recorded",
          description: "Your temperature has been successfully recorded.",
        });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error recording temperature:', error);
      toast({
        title: "Error",
        description: "Failed to record temperature. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const temperatureStatus = getTemperatureStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-orange-500" />
          Body Temperature
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="98.6"
                {...register('temperature', { valueAsNumber: true })}
              />
              {errors.temperature && (
                <p className="text-sm text-red-500">{errors.temperature.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select 
                onValueChange={(value) => setValue('unit', value as 'fahrenheit' | 'celsius')}
                defaultValue="fahrenheit"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fahrenheit">°F (Fahrenheit)</SelectItem>
                  <SelectItem value="celsius">°C (Celsius)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {temperatureStatus && (
            <div className={`text-xs px-2 py-1 rounded ${
              temperatureStatus.status === 'normal' ? 'bg-green-100 text-green-800' :
              temperatureStatus.status === 'elevated' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {temperatureStatus.message}
            </div>
          )}

          {(temperatureStatus?.status === 'high' || temperatureStatus?.status === 'low') && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {temperatureStatus.status === 'high' 
                  ? 'Fever detected. Monitor symptoms and consider consulting healthcare provider.'
                  : 'Low body temperature detected. This may require medical attention.'
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
            {loading ? 'Recording...' : 'Record Temperature'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TemperatureForm;
