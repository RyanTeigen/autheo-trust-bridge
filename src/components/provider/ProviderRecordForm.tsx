
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, Shield } from 'lucide-react';
import { encryptMedicalRecord, anchorRecordToBlockchain } from '@/lib/encryption';

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

  // Mock function to get patient's Kyber public key
  // In production, this would fetch from patient's profile or key management system
  const getPatientKyberPublicKey = async (patientId: string): Promise<string> => {
    // For now, return a mock public key
    // TODO: Replace with actual key retrieval from patient profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('encryption_public_key')
      .eq('id', patientId)
      .single();
    
    // Return mock key if no key is stored (for development)
    return profile?.encryption_public_key || 'mock_kyber_public_key_' + patientId;
  };

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

      // Get patient's public key for encryption
      const patientPublicKey = await getPatientKyberPublicKey(patient.user_id);

      // Create the medical record data
      const recordData = {
        type: form.type,
        value: form.value,
        unit: form.unit,
        timestamp: form.timestamp,
        provider_notes: `Recorded by provider at ${new Date(form.timestamp).toLocaleString()}`,
      };

      // Encrypt the medical record using hybrid encryption
      const { encryptedPayload, encryptedKey } = await encryptMedicalRecord(
        JSON.stringify(recordData),
        patientPublicKey
      );

      // Insert the encrypted medical record directly into the database
      const { data: medicalRecord, error: insertError } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patient.id,
          provider_id: user.id,
          user_id: patient.user_id,
          record_type: form.type,
          encrypted_data: encryptedPayload,
          encrypted_payload: encryptedPayload,
          encrypted_key: encryptedKey,
          iv: 'hybrid_encrypted',
        })
        .select()
        .single();

      if (insertError) {
        throw new Error('Failed to create medical record: ' + insertError.message);
      }

      // Log the action for audit purposes
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'CREATE_RECORD',
        resource: 'medical_record',
        resource_id: medicalRecord.id,
        status: 'success',
        details: `Created encrypted ${form.type} record for patient ${patient.id}`,
        timestamp: new Date().toISOString(),
      });

      // Anchor the record on blockchain for provenance
      try {
        const anchorResult = await anchorRecordToBlockchain(
          medicalRecord.id,
          patient.user_id,
          form.type
        );
        console.log('Record anchored:', anchorResult);
        
        toast({
          title: "Success",
          description: "Medical record created & anchored to blockchain",
        });
      } catch (error) {
        console.error('Error anchoring record on blockchain:', error);
        toast({
          title: "Partial Success",
          description: "Record created but blockchain anchoring failed",
          variant: "destructive",
        });
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
          Create Encrypted Medical Record
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Shield className="h-4 w-4 text-green-400" />
          <span className="text-sm text-green-400">Quantum-safe hybrid encryption enabled</span>
        </div>
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
            {loading ? 'Creating & Encrypting Record...' : 'Create Encrypted Record'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
