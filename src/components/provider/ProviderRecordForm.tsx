
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
import { encryptMedicalRecord, fetchPublicKey } from '@/lib/encryptMedicalRecord';
import { anchorRecordToBlockchain } from '@/lib/encryption';
import { auditLogger } from '@/services/audit/AuditLogger';
import { sha256 } from 'js-sha256';
import PatientSearch from './PatientSearch';

interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  date_of_birth?: string;
}

export default function ProviderRecordForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({
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

    if (!selectedPatient || !form.value) {
      toast({
        title: "Error",
        description: "Please select a patient and fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get patient's public key for encryption
      console.log('🔍 Fetching patient public key...');
      const patientPublicKey = await fetchPublicKey(selectedPatient.id);

      // Create the medical record data
      const recordData = {
        type: form.type,
        value: form.value,
        unit: form.unit,
        timestamp: form.timestamp,
        provider_notes: `Recorded by provider at ${new Date(form.timestamp).toLocaleString()}`,
      };

      console.log('🔐 Encrypting medical record...');
      // Encrypt the medical record using hybrid encryption
      const { encryptedPayload, encryptedKey, algorithm } = await encryptMedicalRecord(
        JSON.stringify(recordData),
        patientPublicKey
      );

      console.log('💾 Storing encrypted record...');
      // Insert the encrypted medical record directly into the database
      const { data: medicalRecord, error: insertError } = await supabase
        .from('medical_records')
        .insert({
          patient_id: selectedPatient.id,
          provider_id: user.id,
          user_id: selectedPatient.user_id,
          record_type: form.type,
          encrypted_data: encryptedPayload,
          encrypted_payload: encryptedPayload,
          encrypted_key: encryptedKey,
          iv: algorithm, // Store algorithm info in iv field
        })
        .select()
        .single();

      if (insertError) {
        throw new Error('Failed to create medical record: ' + insertError.message);
      }

      console.log('✅ Medical record created:', medicalRecord.id);

      // Hash the record data and queue for blockchain anchoring
      console.log('🔗 Queueing for blockchain anchoring...');
      try {
        // Create hash from record data (not encrypted payload)
        const hashInput = `${form.type}|${form.value}|${form.unit}|${form.timestamp}|${selectedPatient.id}|${user.id}`;
        const recordHash = sha256(hashInput);
        
        const { error: queueError } = await supabase
          .from('hash_anchor_queue')
          .insert({
            record_id: medicalRecord.id,
            hash: recordHash,
            patient_id: selectedPatient.user_id,
            provider_id: user.id,
            anchor_status: 'pending'
          });

        if (queueError) {
          console.warn('⚠️ Failed to queue for anchoring:', queueError);
        } else {
          console.log('✅ Record queued for blockchain anchoring');
        }
      } catch (queueError) {
        console.warn('⚠️ Blockchain queueing failed:', queueError);
      }

      // Log the action for comprehensive audit trail
      console.log('📝 Logging audit action...');
      try {
        await auditLogger.logCreate(
          'medical_record',
          medicalRecord.id,
          `Created encrypted ${form.type} record for patient ${selectedPatient.id} with ${algorithm} encryption`
        );
        console.log('✅ Audit log created successfully');
      } catch (auditError) {
        console.warn('⚠️ Audit logging failed:', auditError);
      }

      // Anchor the record on blockchain for provenance
      console.log('⛓️ Anchoring to blockchain...');
      try {
        const anchorResult = await anchorRecordToBlockchain(
          medicalRecord.id,
          selectedPatient.user_id,
          form.type
        );
        console.log('✅ Record anchored:', anchorResult);
        
        toast({
          title: "Success",
          description: `Record saved, encrypted with ${algorithm}, and queued for blockchain anchoring!`,
        });
      } catch (error) {
        console.error('❌ Error anchoring record on blockchain:', error);
        toast({
          title: "Partial Success",
          description: "Record encrypted & saved, but blockchain anchoring failed",
          variant: "destructive",
        });
      }

      // Reset form
      setSelectedPatient(null);
      setForm({
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
          <span className="text-sm text-green-400">Real ML-KEM-768 quantum-safe encryption enabled</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <PatientSearch
            onPatientSelect={setSelectedPatient}
            selectedPatient={selectedPatient}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
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
            disabled={loading || !selectedPatient || !form.value} 
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
