import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: string;
  lastTaken?: string;
  prescribedBy: string;
  instructions?: string;
  refillsRemaining: number;
}

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock data that simulates real medications
  useEffect(() => {
    const now = new Date();
    const mockMedications: Medication[] = [
      {
        id: '1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        nextDose: 'Today, 8:00 PM',
        prescribedBy: 'Dr. Sarah Johnson',
        instructions: 'Take with water, preferably in the evening',
        refillsRemaining: 2
      },
      {
        id: '2',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        nextDose: getNextDoseTime(now, 8, 20), // 8 AM and 8 PM
        prescribedBy: 'Dr. Michael Lee',
        instructions: 'Take with meals to reduce stomach upset',
        refillsRemaining: 1
      },
      {
        id: '3',
        name: 'Vitamin D3',
        dosage: '2000 IU',
        frequency: 'Once daily',
        nextDose: 'Tomorrow, 9:00 AM',
        prescribedBy: 'Dr. Sarah Johnson',
        instructions: 'Take with breakfast',
        refillsRemaining: 0
      }
    ];

    setTimeout(() => {
      setMedications(mockMedications);
      setLoading(false);
    }, 800);
  }, []);

  function getNextDoseTime(now: Date, morningHour: number, eveningHour: number): string {
    const currentHour = now.getHours();
    const today = new Date(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (currentHour < morningHour) {
      return `Today, ${morningHour}:00 AM`;
    } else if (currentHour < eveningHour) {
      return `Today, ${eveningHour === 20 ? '8:00' : '8:00'} PM`;
    } else {
      return `Tomorrow, ${morningHour}:00 AM`;
    }
  }

  const markAsTaken = async (medicationId: string) => {
    try {
      const now = new Date();
      const medication = medications.find(med => med.id === medicationId);
      
      if (!medication) return;

      // Update the medication with last taken time and calculate next dose
      setMedications(prev => 
        prev.map(med => 
          med.id === medicationId 
            ? { 
                ...med, 
                lastTaken: now.toLocaleString(),
                nextDose: calculateNextDose(med.frequency, now)
              }
            : med
        )
      );

      // Log the medication intake
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'MEDICATION_TAKEN',
        resource: 'medications',
        status: 'success',
        details: `Marked ${medication.name} as taken`,
        metadata: { 
          medication_id: medicationId,
          medication_name: medication.name,
          dosage: medication.dosage,
          taken_at: now.toISOString()
        }
      });

      toast({
        title: "Medication Recorded",
        description: `${medication.name} marked as taken at ${now.toLocaleTimeString()}.`,
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

      // In a real app, this would create a refill request
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'REFILL_REQUESTED',
        resource: 'medications',
        status: 'success',
        details: `Refill requested for ${medication.name}`,
        metadata: { 
          medication_id: medicationId,
          medication_name: medication.name,
          prescribed_by: medication.prescribedBy
        }
      });

      toast({
        title: "Refill Requested",
        description: `Refill request sent for ${medication.name}. You'll be notified when it's ready.`,
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

  function calculateNextDose(frequency: string, lastTaken: Date): string {
    const nextDose = new Date(lastTaken);
    
    if (frequency.includes('Once daily')) {
      nextDose.setDate(nextDose.getDate() + 1);
      return `Tomorrow, ${nextDose.getHours()}:00 ${nextDose.getHours() >= 12 ? 'PM' : 'AM'}`;
    } else if (frequency.includes('Twice daily')) {
      nextDose.setHours(nextDose.getHours() + 12);
      const isToday = nextDose.toDateString() === new Date().toDateString();
      return `${isToday ? 'Today' : 'Tomorrow'}, ${nextDose.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else if (frequency.includes('Three times daily')) {
      nextDose.setHours(nextDose.getHours() + 8);
      const isToday = nextDose.toDateString() === new Date().toDateString();
      return `${isToday ? 'Today' : 'Tomorrow'}, ${nextDose.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    return 'Next dose calculated';
  }

  const getDueMedications = () => {
    const now = new Date();
    return medications.filter(med => {
      const nextDose = med.nextDose.toLowerCase();
      return nextDose.includes('today') || 
             (nextDose.includes('now') || 
              nextDose.includes(now.getHours().toString()));
    });
  };

  const getLowRefillMedications = () => {
    return medications.filter(med => med.refillsRemaining <= 1);
  };

  return {
    medications,
    loading,
    dueMedications: getDueMedications(),
    lowRefillMedications: getLowRefillMedications(),
    markAsTaken,
    requestRefill
  };
}