
import React, { useState, useEffect } from 'react';
import PatientSearchForm from './PatientSearchForm';
import PatientSearchResults from './PatientSearchResults';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  name: string;
  dob: string;
  mrn: string;
  email?: string;
}

interface PatientSearchProps {
  onSelectPatient: (patientId: string) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onSelectPatient }) => {
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Load real patients from database
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, full_name, email, mrn, date_of_birth')
          .order('full_name');

        if (error) throw error;
        
        const formattedPatients = data.map(patient => ({
          id: patient.id,
          name: patient.full_name || 'Unknown',
          dob: patient.date_of_birth || '',
          mrn: patient.mrn || `MR-${patient.id.slice(-6)}`,
          email: patient.email
        }));
        
        setAllPatients(formattedPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [toast]);
  
  if (loading) {
    return <div className="p-4 text-center text-slate-400">Loading patients...</div>;
  }
  
  return (
    <div className="space-y-4">
      <PatientSearchForm 
        onSearch={setSearchResults}
        patients={allPatients}
      />
      
      <PatientSearchResults 
        patients={searchResults}
        onSelectPatient={onSelectPatient}
      />
    </div>
  );
};

export default PatientSearch;
