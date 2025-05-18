
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PatientSearchProps {
  patientId: string;
  setPatientId: (id: string) => void;
  setPatientInfo: (info: PatientInfo | null) => void;
}

export interface PatientInfo {
  id: string;
  name: string;
  email?: string;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ patientId, setPatientId, setPatientInfo }) => {
  const { toast } = useToast();

  const searchPatient = async () => {
    if (!patientId) {
      toast({
        title: "Patient ID Required",
        description: "Please enter a patient identifier to continue",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // In a real app, this would search the platform's directory service
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', patientId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setPatientInfo({
          id: data.id,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email: data.email
        });
        
        toast({
          title: "Patient Found",
          description: "Patient record was located in the system.",
        });
      } else {
        toast({
          title: "Patient Not Found",
          description: "No patient found with the provided ID.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error searching for patient:", error);
      
      // For demo purposes, show a found patient even if there's an API error
      setPatientInfo({
        id: patientId,
        name: "Sample Patient",
      });
      
      toast({
        title: "Search Error",
        description: "Demo mode: Patient record will be simulated",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-200 mb-1">
        Patient Identifier
      </label>
      <div className="flex space-x-2">
        <Input
          placeholder="Enter patient ID or wallet address"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="bg-slate-700 border-slate-600 text-slate-100"
        />
        <Button 
          onClick={searchPatient}
          className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
        >
          Search
        </Button>
      </div>
      <p className="text-xs text-slate-400 mt-1">
        Enter the patient's unique identifier or wallet address
      </p>
    </div>
  );
};

export default PatientSearch;
