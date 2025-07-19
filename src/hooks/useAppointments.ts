
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  provider: string;
  date: string;
  time: string;
  type: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  appointment_date?: string;
  access_request_status?: string;
  provider_id?: string;
  urgency_level?: string;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First get the patient record for the current user
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) {
        console.error('Error fetching patient:', patientError);
        // If no patient record exists, create one
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            user_id: user.id,
            full_name: user.email || 'Unknown',
            email: user.email || ''
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating patient:', createError);
          setLoading(false);
          return;
        }
        
        if (newPatient) {
          await fetchAppointmentsForPatient(newPatient.id);
        }
      } else if (patientData) {
        await fetchAppointmentsForPatient(patientData.id);
      }
    } catch (error) {
      console.error('Error in fetchAppointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentsForPatient = async (patientId: string) => {
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('enhanced_appointments')
      .select(`
        id,
        appointment_type,
        appointment_date,
        status,
        urgency_level,
        clinical_notes,
        access_request_status,
        provider_id,
        profiles (
          full_name,
          first_name,
          last_name,
          email
        )
      `)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: true });

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      return;
    }

    if (appointmentsData) {
      const formattedAppointments: Appointment[] = appointmentsData.map(apt => {
        const appointmentDate = new Date(apt.appointment_date);
        const provider = apt.profiles 
          ? apt.profiles.full_name || `${apt.profiles.first_name || ''} ${apt.profiles.last_name || ''}`.trim() || apt.profiles.email
          : 'Unknown Provider';

        return {
          id: apt.id,
          provider,
          date: appointmentDate.toLocaleDateString(),
          time: appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: apt.appointment_type,
          location: getLocationForType(apt.appointment_type),
          status: apt.status === 'scheduled' ? 'scheduled' : apt.status === 'completed' ? 'completed' : 'cancelled',
          notes: apt.clinical_notes || '',
          appointment_date: apt.appointment_date,
          access_request_status: apt.access_request_status,
          provider_id: apt.provider_id,
          urgency_level: apt.urgency_level
        };
      });

      setAppointments(formattedAppointments);
    }
  };

  const getLocationForType = (type: string): string => {
    const locationMap: Record<string, string> = {
      'Follow-up': 'Main Clinic',
      'Consultation': 'Specialist Office',
      'Emergency': 'Emergency Department',
      'Lab Work': 'Laboratory',
      'Vaccination': 'Immunization Clinic',
      'Mental Health': 'Behavioral Health Center',
      'Physical Therapy': 'Rehabilitation Center',
      'Telehealth': 'Virtual',
      'Annual Physical': 'Primary Care'
    };
    return locationMap[type] || 'Main Hospital';
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('enhanced_appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' as const }
            : apt
        )
      );

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'CANCEL_APPOINTMENT',
        resource: 'enhanced_appointments',
        resource_id: appointmentId,
        status: 'success',
        details: `Cancelled appointment ${appointmentId}`,
        metadata: { appointment_id: appointmentId }
      });

      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const rescheduleAppointment = async (appointmentId: string, newDate: string, newTime: string) => {
    try {
      const newDateTime = new Date(`${newDate} ${newTime}`);
      
      const { error } = await supabase
        .from('enhanced_appointments')
        .update({ appointment_date: newDateTime.toISOString() })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, date: newDate, time: newTime }
            : apt
        )
      );

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'RESCHEDULE_APPOINTMENT',
        resource: 'enhanced_appointments',
        resource_id: appointmentId,
        status: 'success',
        details: `Rescheduled appointment ${appointmentId} to ${newDate} at ${newTime}`,
        metadata: { appointment_id: appointmentId, new_date: newDate, new_time: newTime }
      });

      toast({
        title: "Appointment Rescheduled",
        description: `Your appointment has been moved to ${newDate} at ${newTime}.`,
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => 
        apt.status === 'scheduled' && 
        new Date(apt.appointment_date || apt.date) >= now
      )
      .sort((a, b) => {
        const dateA = new Date(a.appointment_date || a.date);
        const dateB = new Date(b.appointment_date || b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3);
  };

  const getTodayAppointments = () => {
    const today = new Date().toLocaleDateString();
    return appointments.filter(apt => apt.date === today && apt.status === 'scheduled');
  };

  return {
    appointments,
    loading,
    upcomingAppointments: getUpcomingAppointments(),
    todayAppointments: getTodayAppointments(),
    cancelAppointment,
    rescheduleAppointment,
    refreshAppointments: fetchAppointments
  };
}
