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
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock data that simulates real appointments
  useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        provider: 'Dr. Sarah Johnson',
        date: new Date(Date.now() + 86400000 * 3).toLocaleDateString(), // 3 days from now
        time: '10:30 AM',
        type: 'Follow-up',
        location: 'Main Clinic',
        status: 'scheduled'
      },
      {
        id: '2',
        provider: 'Dr. Michael Lee',
        date: new Date(Date.now() + 86400000 * 7).toLocaleDateString(), // 1 week from now
        time: '2:15 PM',
        type: 'Consultation',
        location: 'Virtual',
        status: 'scheduled'
      },
      {
        id: '3',
        provider: 'Dr. Lisa Wong',
        date: new Date().toLocaleDateString(), // Today
        time: '9:00 AM',
        type: 'Check-up',
        location: 'Telehealth',
        status: 'scheduled'
      }
    ];

    // Simulate loading delay
    setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 1000);
  }, []);

  const cancelAppointment = async (appointmentId: string) => {
    try {
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' as const }
            : apt
        )
      );

      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'CANCEL_APPOINTMENT',
        resource: 'appointments',
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
        resource: 'appointments',
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
    return appointments
      .filter(apt => apt.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3); // Show next 3 appointments
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
    rescheduleAppointment
  };
}