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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, Clock, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAtomicDataAPI } from '@/hooks/useAtomicDataAPI';

const glucoseSchema = z.object({
  glucose: z.number().min(20, 'Glucose level too low').max(600, 'Glucose level too high'),
  recordedAt: z.string().min(1, 'Date and time are required'),
  mealTiming: z.enum(['fasting', 'before_meal', 'after_meal', '2hr_post_meal', 'bedtime', 'random']),
  notes: z.string().optional()
});

const hba1cSchema = z.object({
  hba1c: z.number().min(3, 'HbA1c too low').max(20, 'HbA1c too high'),
  recordedAt: z.string().min(1, 'Date and time are required'),
  testType: z.enum(['lab', 'home', 'point_of_care']),
  notes: z.string().optional()
});

type GlucoseFormData = z.infer<typeof glucoseSchema>;
type HbA1cFormData = z.infer<typeof hba1cSchema>;

interface GlucoseFormProps {
  onSuccess?: () => void;
}

const GlucoseForm: React.FC<GlucoseFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('glucose');
  const { toast } = useToast();
  const { insertGlucoseData } = useAtomicDataAPI();

  // Glucose form
  const glucoseForm = useForm<GlucoseFormData>({
    resolver: zodResolver(glucoseSchema),
    defaultValues: {
      recordedAt: new Date().toISOString().slice(0, 16),
      mealTiming: 'fasting'
    }
  });

  // HbA1c form
  const hba1cForm = useForm<HbA1cFormData>({
    resolver: zodResolver(hba1cSchema),
    defaultValues: {
      recordedAt: new Date().toISOString().slice(0, 16),
      testType: 'home'
    }
  });

  const glucose = glucoseForm.watch('glucose');
  const mealTiming = glucoseForm.watch('mealTiming');
  const hba1c = hba1cForm.watch('hba1c');

  const getGlucoseStatus = () => {
    if (!glucose) return null;
    
    // Different ranges based on meal timing
    switch (mealTiming) {
      case 'fasting':
        if (glucose < 70) return { status: 'low', message: 'Low fasting glucose (hypoglycemia)', color: 'red' };
        if (glucose <= 99) return { status: 'normal', message: 'Normal fasting glucose', color: 'green' };
        if (glucose <= 125) return { status: 'prediabetic', message: 'Prediabetic fasting glucose', color: 'yellow' };
        return { status: 'diabetic', message: 'Diabetic fasting glucose', color: 'red' };
      
      case '2hr_post_meal':
        if (glucose < 70) return { status: 'low', message: 'Low post-meal glucose', color: 'red' };
        if (glucose <= 139) return { status: 'normal', message: 'Normal post-meal glucose', color: 'green' };
        if (glucose <= 199) return { status: 'prediabetic', message: 'Prediabetic post-meal glucose', color: 'yellow' };
        return { status: 'diabetic', message: 'Diabetic post-meal glucose', color: 'red' };
      
      default:
        if (glucose < 70) return { status: 'low', message: 'Low glucose (hypoglycemia)', color: 'red' };
        if (glucose <= 180) return { status: 'normal', message: 'Normal glucose range', color: 'green' };
        return { status: 'high', message: 'High glucose level', color: 'red' };
    }
  };

  const getHbA1cStatus = () => {
    if (!hba1c) return null;
    
    if (hba1c < 5.7) return { status: 'normal', message: 'Normal HbA1c', color: 'green' };
    if (hba1c <= 6.4) return { status: 'prediabetic', message: 'Prediabetic HbA1c', color: 'yellow' };
    if (hba1c <= 7.0) return { status: 'diabetic_good', message: 'Diabetic - Good control', color: 'blue' };
    if (hba1c <= 8.0) return { status: 'diabetic_fair', message: 'Diabetic - Fair control', color: 'yellow' };
    return { status: 'diabetic_poor', message: 'Diabetic - Poor control', color: 'red' };
  };

  const onSubmitGlucose = async (data: GlucoseFormData) => {
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

  const onSubmitHbA1c = async (data: HbA1cFormData) => {
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

  const glucoseStatus = getGlucoseStatus();
  const hba1cStatus = getHbA1cStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          Glucose & Diabetes Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="glucose" className="flex items-center gap-2">
              <Utensils className="h-3 w-3" />
              Blood Glucose
            </TabsTrigger>
            <TabsTrigger value="hba1c" className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              HbA1c
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="glucose">
            <form onSubmit={glucoseForm.handleSubmit(onSubmitGlucose)} className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="hba1c">
            <form onSubmit={hba1cForm.handleSubmit(onSubmitHbA1c)} className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GlucoseForm;
