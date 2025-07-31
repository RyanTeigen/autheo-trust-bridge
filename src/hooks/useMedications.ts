import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'discontinued';
  refills_remaining: number;
  total_refills: number;
  prescribed_by: string;
  provider_id: string;
  patient_id: string;
  created_at: string;
}

export interface MedicationAdherence {
  id: string;
  medication_id: string;
  taken_at: string;
  scheduled_time: string;
  status: 'taken' | 'missed' | 'delayed';
  notes?: string;
}

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Use mock data for now until Supabase types are updated
  useEffect(() => {
    const mockMedications: Medication[] = [
      {
        id: '1',
        medication_name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        instructions: 'Take with water, preferably in the evening',
        start_date: '2024-01-01',
        status: 'active',
        refills_remaining: 2,
        total_refills: 5,
        prescribed_by: 'Dr. Sarah Johnson',
        provider_id: 'provider-1',
        patient_id: 'patient-1',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        medication_name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        instructions: 'Take with meals to reduce stomach upset',
        start_date: '2024-01-01',
        status: 'active',
        refills_remaining: 1,
        total_refills: 3,
        prescribed_by: 'Dr. Michael Lee',
        provider_id: 'provider-2',
        patient_id: 'patient-1',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        medication_name: 'Vitamin D3',
        dosage: '2000 IU',
        frequency: 'Once daily',
        instructions: 'Take with breakfast',
        start_date: '2024-01-01',
        status: 'active',
        refills_remaining: 0,
        total_refills: 2,
        prescribed_by: 'Dr. Sarah Johnson',
        provider_id: 'provider-1',
        patient_id: 'patient-1',
        created_at: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setMedications(mockMedications);
      setLoading(false);
    }, 800);
  }, []);

  // This will be implemented once Supabase types are updated
  const fetchMedications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get patient ID for current user
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) {
        setMedications([]);
        return;
      }

      // TODO: Implement once Supabase types are updated
      // const { data: prescriptions, error } = await supabase
      //   .from('prescriptions')
      //   .select('*')
      //   .eq('patient_id', patient.id)
      //   .eq('status', 'active')
      //   .order('created_at', { ascending: false });

      setMedications([]);
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast({
        title: "Error",
        description: "Failed to load medications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (medicationId: string) => {
    try {
      const now = new Date();
      const medication = medications.find(med => med.id === medicationId);
      
      if (!medication) return;

      // TODO: Implement once Supabase types are updated
      // Record medication adherence
      // const { error: adherenceError } = await supabase
      //   .from('medication_adherence')
      //   .insert({
      //     medication_id: medicationId,
      //     patient_id: medication.patient_id,
      //     taken_at: now.toISOString(),
      //     scheduled_time: now.toISOString(),
      //     status: 'taken',
      //     notes: 'Taken via patient dashboard'
      //   });

      // Log the medication intake
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'MEDICATION_TAKEN',
        resource: 'medications',
        status: 'success',
        details: `Marked ${medication.medication_name} as taken`,
        metadata: { 
          medication_id: medicationId,
          medication_name: medication.medication_name,
          dosage: medication.dosage,
          taken_at: now.toISOString()
        }
      });

      toast({
        title: "Medication Recorded",
        description: `${medication.medication_name} marked as taken at ${now.toLocaleTimeString()}.`,
      });
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      toast({
        title: "Error",
        description: "Failed to record medication. Please try again.",
        variant: "destructive"
      });
    }
  };

  const requestRefill = async (medicationId: string) => {
    try {
      const medication = medications.find(med => med.id === medicationId);
      if (!medication) return;

      // TODO: Implement once Supabase types are updated
      // Create refill request
      // const { error } = await supabase
      //   .from('prescription_refill_requests')
      //   .insert({
      //     prescription_id: medicationId,
      //     patient_id: medication.patient_id,
      //     provider_id: medication.provider_id,
      //     status: 'pending',
      //     request_reason: 'Patient requested refill via dashboard',
      //     requested_at: new Date().toISOString()
      //   });

      // Log the refill request
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'REFILL_REQUESTED',
        resource: 'medications',
        status: 'success',
        details: `Refill requested for ${medication.medication_name}`,
        metadata: { 
          medication_id: medicationId,
          medication_name: medication.medication_name,
          prescribed_by: medication.prescribed_by
        }
      });

      toast({
        title: "Refill Requested",
        description: `Refill request sent for ${medication.medication_name}. You'll be notified when it's ready.`,
      });
    } catch (error) {
      console.error('Error requesting refill:', error);
      toast({
        title: "Error",
        description: "Failed to request refill. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getDueMedications = () => {
    // In a real implementation, this would check against scheduled times
    // For now, we'll consider all active medications as potentially due
    return medications.filter(med => med.status === 'active');
  };

  const getLowRefillMedications = () => {
    return medications.filter(med => med.refills_remaining <= 1);
  };

  // Helper function to get next dose time (simplified)
  const getNextDoseTime = (medication: Medication): string => {
    const now = new Date();
    
    if (medication.frequency.toLowerCase().includes('once')) {
      return `Tomorrow, 8:00 AM`;
    } else if (medication.frequency.toLowerCase().includes('twice')) {
      const nextDose = new Date(now);
      nextDose.setHours(nextDose.getHours() + 12);
      return `Today, ${nextDose.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    return 'Next dose calculated';
  };

  return {
    medications,
    loading,
    dueMedications: getDueMedications(),
    lowRefillMedications: getLowRefillMedications(),
    markAsTaken,
    requestRefill,
    refetchMedications: fetchMedications,
    getNextDoseTime
  };
}