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

  // Fetch medications from Supabase
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

      // Fetch prescriptions for the patient
      const { data: prescriptions, error } = await supabase
        .from('prescriptions')
        .select(`
          id,
          medication_name,
          dosage,
          frequency,
          instructions,
          start_date,
          end_date,
          status,
          refills_remaining,
          total_refills,
          prescribed_by,
          provider_id,
          patient_id,
          created_at
        `)
        .eq('patient_id', patient.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching medications:', error);
        toast({
          title: "Error",
          description: "Failed to load medications. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setMedications(prescriptions || []);
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

  useEffect(() => {
    fetchMedications();
  }, [user]);

  const markAsTaken = async (medicationId: string) => {
    try {
      const now = new Date();
      const medication = medications.find(med => med.id === medicationId);
      
      if (!medication) return;

      // Record medication adherence
      const { error: adherenceError } = await supabase
        .from('medication_adherence')
        .insert({
          medication_id: medicationId,
          patient_id: medication.patient_id,
          taken_at: now.toISOString(),
          scheduled_time: now.toISOString(), // In real app, this would be the scheduled time
          status: 'taken',
          notes: 'Taken via patient dashboard'
        });

      if (adherenceError) {
        console.error('Error recording adherence:', adherenceError);
        toast({
          title: "Error",
          description: "Failed to record medication. Please try again.",
          variant: "destructive"
        });
        return;
      }

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

      // Create refill request
      const { error } = await supabase
        .from('prescription_refill_requests')
        .insert({
          prescription_id: medicationId,
          patient_id: medication.patient_id,
          provider_id: medication.provider_id,
          status: 'pending',
          request_reason: 'Patient requested refill via dashboard',
          requested_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error requesting refill:', error);
        toast({
          title: "Error",
          description: "Failed to request refill. Please try again.",
          variant: "destructive"
        });
        return;
      }

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
    const startTime = new Date();
    
    if (medication.frequency.toLowerCase().includes('once')) {
      startTime.setDate(now.getDate() + 1);
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