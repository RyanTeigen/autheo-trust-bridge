
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';
import { anchorRecordOnChain } from '@/utils/blockchain';

export default function ProviderRecordForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    patientId: '',
    type: 'blood_pressure',
    value: '',
    unit: '',
    timestamp: new Date().toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create records",
        variant: "destructive",
      });
      return;
    }

    if (!form.patientId || !form.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // First, try to find the patient by ID or email
      let patientQuery = supabase
        .from('patients')
        .select('id, user_id')
        .eq('id', form.patientId);

      // If it looks like an email, search by email instead
      if (form.patientId.includes('@')) {
        patientQuery = supabase
          .from('patients')
          .select('id, user_id')
          .eq('email', form.patientId);
      }

      const { data: patient, error: patientError } = await patientQuery.maybeSingle();

      if (patientError) {
        throw new Error('Error finding patient: ' + patientError.message);
      }

      if (!patient) {
        toast({
          title: "Error",
          description: "Patient not found",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create the medical record data
      const recordData = {
        title: `${form.type.replace('_', ' ')} Record`,
        description: `${form.type}: ${form.value} ${form.unit}`,
        category: form.type,
        notes: `Recorded by provider at ${new Date(form.timestamp).toLocaleString()}`,
        value: form.value,
        unit: form.unit,
        recorded_at: form.timestamp,
      };

      // Use the medical records API
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create medical record');
      }

      // Log the action for audit purposes
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'CREATE_RECORD',
        resource: 'medical_record',
        resource_id: result.data.id,
        status: 'success',
        details: `Created ${form.type} record for patient ${patient.id}`,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Medical record created successfully",
      });

      // Anchor the record on blockchain
      try {
        await anchorRecordOnChain(result.data.id);
      } catch (error) {
        console.error('Error anchoring record on blockchain:', error);
        // Don't fail the entire operation if blockchain anchoring fails
      }

      // Reset form
      setForm({
        patientId: '',
        type: 'blood_pressure',
        value: '',
        unit: '',
        timestamp: new Date().toISOString().slice(0, 16),
      });

    } catch (error) {
      console.error('Error creating medical record:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create medical record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create Medical Record
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient" className="text-slate-200">Patient ID or Email</Label>
              <Input 
                id="patient" 
                value={form.patientId} 
                onChange={(e) => handleChange('patientId', e.target.value)}
                placeholder="Enter patient ID or email"
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Record Type</Label>
              <Select value={form.type} onValueChange={(v) => handleChange('type', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                  <SelectItem value="heart_rate">Heart Rate</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="height">Height</SelectItem>
                  <SelectItem value="allergy">Allergy</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="note">Clinical Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Value</Label>
              <Input 
                value={form.value} 
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="Enter value"
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Unit</Label>
              <Input 
                value={form.unit} 
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="e.g., mmHg, kg, °C"
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-200">Timestamp</Label>
              <Input 
                type="datetime-local" 
                value={form.timestamp} 
                onChange={(e) => handleChange('timestamp', e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
          </div>

          <Button 
            disabled={loading || !form.patientId || !form.value} 
            onClick={handleSubmit}
            className="w-full bg-autheo-primary hover:bg-autheo-primary/90"
          >
            {loading ? 'Creating Record...' : 'Create Medical Record'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
