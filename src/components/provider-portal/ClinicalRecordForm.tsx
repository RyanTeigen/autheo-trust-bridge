import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Shield, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  full_name: string;
  email?: string;
  mrn?: string;
  date_of_birth?: string;
}

interface ClinicalRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ClinicalRecordForm: React.FC<ClinicalRecordFormProps> = ({ onSuccess, onCancel }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    record_type: 'consultation',
    title: '',
    clinical_notes: '',
    diagnosis: '',
    treatment_plan: '',
    medications: '',
    follow_up: '',
    visit_date: new Date().toISOString().split('T')[0],
    vital_signs: '',
    lab_results: '',
    imaging_results: '',
    provider_notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Mock patient data - replace with actual API call
  useEffect(() => {
    const mockPatients: Patient[] = [
      {
        id: '1',
        full_name: 'John Doe',
        email: 'john.doe@email.com',
        mrn: 'MRN001',
        date_of_birth: '1985-06-15'
      },
      {
        id: '2', 
        full_name: 'Jane Smith',
        email: 'jane.smith@email.com',
        mrn: 'MRN002',
        date_of_birth: '1992-03-22'
      },
      {
        id: '3',
        full_name: 'Bob Johnson', 
        email: 'bob.johnson@email.com',
        mrn: 'MRN003',
        date_of_birth: '1978-11-08'
      }
    ];
    setPatients(mockPatients);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.mrn?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.email?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast({
        title: "Patient Required",
        description: "Please select a patient for this clinical record.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would call your API to create the clinical record
      // const clinicalRecord = {
      //   ...formData,
      //   patient_id: selectedPatient.id,
      //   provider_id: currentUser.id, // from auth context
      // };
      // await createClinicalRecord(clinicalRecord);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Clinical Record Created",
        description: `Clinical record for ${selectedPatient.full_name} has been created successfully.`
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating clinical record:', error);
      toast({
        title: "Error",
        description: "Failed to create clinical record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Selection */}
      <Card className="bg-slate-700/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search patients by name, MRN, or email..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-slate-100"
            />
          </div>
          
          {patientSearch && filteredPatients.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setPatientSearch('');
                  }}
                  className="p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <div className="font-medium text-slate-200">{patient.full_name}</div>
                  <div className="text-sm text-slate-400">
                    MRN: {patient.mrn} • DOB: {patient.date_of_birth}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedPatient && (
            <div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200">{selectedPatient.full_name}</div>
                  <div className="text-sm text-slate-400">MRN: {selectedPatient.mrn}</div>
                </div>
                <Badge variant="default" className="bg-green-600">Selected</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="record_type" className="text-slate-200">Record Type *</Label>
          <Select value={formData.record_type} onValueChange={(value) => handleInputChange('record_type', value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="diagnosis">Diagnosis</SelectItem>
              <SelectItem value="treatment">Treatment</SelectItem>
              <SelectItem value="lab_results">Lab Results</SelectItem>
              <SelectItem value="imaging">Imaging</SelectItem>
              <SelectItem value="prescription">Prescription</SelectItem>
              <SelectItem value="procedure">Procedure</SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="visit_date" className="text-slate-200">Visit Date</Label>
          <Input
            id="visit_date"
            type="date"
            value={formData.visit_date}
            onChange={(e) => handleInputChange('visit_date', e.target.value)}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="title" className="text-slate-200">Record Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Brief title for this clinical record"
          required
          className="bg-slate-700 border-slate-600 text-slate-100"
        />
      </div>

      <div>
        <Label htmlFor="clinical_notes" className="text-slate-200">Clinical Notes *</Label>
        <Textarea
          id="clinical_notes"
          value={formData.clinical_notes}
          onChange={(e) => handleInputChange('clinical_notes', e.target.value)}
          placeholder="Detailed clinical observations and notes..."
          required
          rows={4}
          className="bg-slate-700 border-slate-600 text-slate-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="diagnosis" className="text-slate-200">Diagnosis</Label>
          <Textarea
            id="diagnosis"
            value={formData.diagnosis}
            onChange={(e) => handleInputChange('diagnosis', e.target.value)}
            placeholder="Primary and secondary diagnoses..."
            rows={3}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
        
        <div>
          <Label htmlFor="treatment_plan" className="text-slate-200">Treatment Plan</Label>
          <Textarea
            id="treatment_plan"
            value={formData.treatment_plan}
            onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
            placeholder="Recommended treatment approach..."
            rows={3}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="medications" className="text-slate-200">Medications</Label>
          <Textarea
            id="medications"
            value={formData.medications}
            onChange={(e) => handleInputChange('medications', e.target.value)}
            placeholder="Prescribed medications and dosages..."
            rows={2}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
        
        <div>
          <Label htmlFor="vital_signs" className="text-slate-200">Vital Signs</Label>
          <Input
            id="vital_signs"
            value={formData.vital_signs}
            onChange={(e) => handleInputChange('vital_signs', e.target.value)}
            placeholder="BP: 120/80, HR: 72, Temp: 98.6°F"
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="provider_notes" className="text-slate-200">Provider Notes</Label>
        <Textarea
          id="provider_notes"
          value={formData.provider_notes}
          onChange={(e) => handleInputChange('provider_notes', e.target.value)}
          placeholder="Additional provider observations and recommendations..."
          rows={3}
          className="bg-slate-700 border-slate-600 text-slate-100"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !selectedPatient}
          className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
              Creating Record...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Create Clinical Record
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ClinicalRecordForm;