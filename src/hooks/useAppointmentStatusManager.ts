
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export const useAppointmentStatusManager = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: AppointmentStatus,
    notes?: string
  ) => {
    setIsUpdating(true);
    
    try {
      // Update the appointment status
      const { error: updateError } = await supabase
        .from('enhanced_appointments')
        .update({
          status: newStatus,
          clinical_notes: notes || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      // Insert audit trail
      await supabase.from('appointment_audit_trail').insert({
        appointment_id: appointmentId,
        action: `STATUS_CHANGED_TO_${newStatus.toUpperCase()}`,
        performed_by: (await supabase.auth.getUser()).data.user?.id,
        details: {
          old_status: 'scheduled', // This would ideally come from the previous state
          new_status: newStatus,
          notes: notes,
          timestamp: new Date().toISOString()
        }
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['provider-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['provider-metrics'] });

      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${newStatus.replace('_', ' ')}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const startAppointment = async (appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'in_progress', 'Appointment started');
  };

  const completeAppointment = async (appointmentId: string, notes?: string) => {
    return updateAppointmentStatus(appointmentId, 'completed', notes);
  };

  const cancelAppointment = async (appointmentId: string, reason?: string) => {
    return updateAppointmentStatus(appointmentId, 'cancelled', reason);
  };

  const markNoShow = async (appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'no_show', 'Patient did not show up');
  };

  return {
    isUpdating,
    updateAppointmentStatus,
    startAppointment,
    completeAppointment,
    cancelAppointment,
    markNoShow
  };
};
