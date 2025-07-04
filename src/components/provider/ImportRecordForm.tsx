import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { anchorRecordOnChain } from '@/utils/blockchain';
import { Upload, FileText, Shield } from 'lucide-react';

// Simple encryption function (matching MedicalRecordsService.ts)
const ENCRYPTION_KEY = 'medical-records-key-2024';

function encryptValue(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return btoa(result); // Base64 encode the result
}

interface Patient {
  id: string;
  full_name: string;
  email?: string;
  mrn?: string;
}

const ImportRecordForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    record_type: 'blood_pressure',
    value: '',
    unit: '',
    notes: '',
    timestamp: new Date().toISOString().slice(0, 16), // datetime-local format
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, email, mrn')
        .order('full_name');

      if (error) throw error;

      const patientsWithMRN = (data || []).map(patient => ({
        ...patient,
        mrn: patient.mrn || `MR-${patient.id.slice(-6)}`
      }));

      setPatients(patientsWithMRN);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to import records",
        variant: "destructive"
      });
      return;
    }

    if (!formData.patient_id || !formData.value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create record data with encryption
      const recordData = {
        title: `${formData.record_type.replace('_', ' ')} Record`,
        description: `${formData.record_type}: ${formData.value} ${formData.unit}`.trim(),
        category: formData.record_type,
        notes: formData.notes || `Imported record - ${formData.record_type}`,
        encrypted_data: encryptValue(JSON.stringify({
          type: formData.record_type,
          value: formData.value,
          unit: formData.unit,
          timestamp: formData.timestamp,
          notes: formData.notes
        })),
        record_hash: `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        provider_id: user.id,
        patient_id: formData.patient_id,
        user_id: user.id, // Provider who created the record
        created_at: new Date(formData.timestamp).toISOString(),
        record_type: formData.record_type
      };

      // Insert into medical_records table
      const { data: newRecord, error } = await supabase
        .from('medical_records')
        .insert(recordData)
        .select()
        .single();

      if (error) throw error;

      // Log the action for audit purposes
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'IMPORT_RECORD',
        resource: 'medical_record',
        resource_id: newRecord.id,
        status: 'success',
        details: `Imported ${formData.record_type} record for patient ${formData.patient_id}`,
        timestamp: new Date().toISOString(),
      });

      // Anchor the record on blockchain
      try {
        await anchorRecordOnChain(newRecord.id);
      } catch (error) {
        console.error('Error anchoring record on blockchain:', error);
        // Don't fail the entire operation if blockchain anchoring fails
      }

      toast({
        title: "Success",
        description: "Medical record imported successfully",
      });

      // Reset form
      setFormData({
        patient_id: '',
        record_type: 'blood_pressure',
        value: '',
        unit: '',
        notes: '',
        timestamp: new Date().toISOString().slice(0, 16),
      });

    } catch (error) {
      console.error('Error importing medical record:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import medical record",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Medical Record
        </CardTitle>
        <CardDescription>
          Import and encrypt patient medical records with blockchain anchoring
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient" className="text-slate-200">Patient *</Label>
              <Select value={formData.patient_id} onValueChange={(v) => handleInputChange('patient_id', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name} ({patient.mrn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Record Type *</Label>
              <Select value={formData.record_type} onValueChange={(v) => handleInputChange('record_type', v)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                  <SelectItem value="heart_rate">Heart Rate</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="glucose">Blood Glucose</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="height">Height</SelectItem>
                  <SelectItem value="cholesterol">Cholesterol</SelectItem>
                  <SelectItem value="allergy">Allergy</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="lab_result">Lab Result</SelectItem>
                  <SelectItem value="diagnosis">Diagnosis</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Value *</Label>
              <Input 
                value={formData.value} 
                onChange={(e) => handleInputChange('value', e.target.value)}
                placeholder="Enter measurement or value"
                className="bg-slate-700 border-slate-600 text-slate-100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Unit</Label>
              <Input 
                value={formData.unit} 
                onChange={(e) => handleInputChange('unit', e.target.value)}
                placeholder="e.g., mmHg, kg, °C, mg/dL"
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-200">Timestamp *</Label>
              <Input 
                type="datetime-local" 
                value={formData.timestamp} 
                onChange={(e) => handleInputChange('timestamp', e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-200">Additional Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Optional clinical notes or context..."
                rows={3}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <Shield className="h-4 w-4 text-blue-400" />
            <div className="text-blue-200 text-sm">
              <strong>Security:</strong> Record will be encrypted before storage and anchored on blockchain for integrity verification.
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading || !formData.patient_id || !formData.value} 
            className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                Importing Record...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Import Medical Record
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ImportRecordForm;