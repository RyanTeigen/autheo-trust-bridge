
import React, { useState, useEffect } from 'react';
import { usePatientAPI } from '@/hooks/usePatientAPI';
import { useMedicalRecordsAPI } from '@/hooks/useMedicalRecordsAPI';
import { useToast } from '@/hooks/use-toast';
import AdvancedPatientSearch from '@/components/emr/AdvancedPatientSearch';

interface Patient {
  id: string;
  full_name: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  address?: string;
  mrn?: string;
  allergies?: string[];
  emergency_contact?: string;
}

// Transform Patient to PatientRecord for AdvancedPatientSearch
interface PatientRecord {
  id: string;
  name: string;
  dob: string;
  mrn: string;
  email?: string;
  phone?: string;
  address?: string;
  allergies?: string[];
  medicalRecords?: any[];
}

const PatientsTab: React.FC = () => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const patientAPI = usePatientAPI();
  const medicalRecordsAPI = useMedicalRecordsAPI();
  const { toast } = useToast();

  const transformPatientToRecord = (patient: Patient): PatientRecord => ({
    id: patient.id,
    name: patient.full_name,
    dob: patient.date_of_birth || '',
    mrn: patient.mrn || `MR-${patient.id.slice(-6)}`,
    email: patient.email,
    phone: patient.phone,
    address: patient.address,
    allergies: patient.allergies,
    medicalRecords: []
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await patientAPI.getPatients({ limit: 50 });
      
      if (result.success && result.data) {
        const transformedPatients = result.data.map(transformPatientToRecord);
        setPatients(transformedPatients);
        console.log('Fetched patients:', transformedPatients.length);
      } else {
        throw new Error(result.error || 'Failed to fetch patients');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patients';
      setError(errorMessage);
      console.error('Error fetching patients:', err);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchResults = (results: PatientRecord[]) => {
    console.log('Search results:', results);
    // Additional handling for search results if needed
  };

  if (loading) {
    return (
      <div className="space-y-6 bg-slate-900 text-slate-100">
        <div className="flex flex-col space-y-2">
          <h3 className="text-2xl font-semibold">Patient Records</h3>
          <p className="text-slate-400">Loading patient records...</p>
        </div>
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 bg-slate-900 text-slate-100">
        <div className="flex flex-col space-y-2">
          <h3 className="text-2xl font-semibold">Patient Records</h3>
          <p className="text-red-400">Error loading patient records</p>
        </div>
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchPatients}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-900 text-slate-100">
      <div className="flex flex-col space-y-2">
        <h3 className="text-2xl font-semibold">Patient Records</h3>
        <p className="text-slate-400">
          Search and manage patient records ({patients.length} patients)
        </p>
      </div>
      
      <AdvancedPatientSearch 
        patients={patients}
        onSearch={handleSearchResults}
      />
      
      {patients.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">No patients found</p>
        </div>
      )}
    </div>
  );
};

export default PatientsTab;
