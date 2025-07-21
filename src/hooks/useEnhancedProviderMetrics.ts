
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedProviderMetrics {
  patientsToday: number;
  completedAppointments: number;
  upcomingAppointments: number;
  inProgressAppointments: number;
  averageWaitTime: string;
  patientSatisfaction: number;
  pendingTasks: number;
  totalAppointmentsThisWeek: number;
  completionRate: number;
  noShowRate: number;
}

export const useEnhancedProviderMetrics = () => {
  const { user } = useAuth();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['provider-metrics', user?.id],
    queryFn: async (): Promise<EnhancedProviderMetrics> => {
      if (!user) throw new Error('No user found');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      // Fetch all appointments for calculations
      const { data: appointments } = await supabase
        .from('enhanced_appointments')
        .select('*')
        .eq('provider_id', user.id)
        .order('appointment_date', { ascending: true });

      if (!appointments) throw new Error('Failed to fetch appointments');

      // Calculate metrics
      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= today && aptDate < tomorrow;
      });

      const completedAppointments = appointments.filter(apt => apt.status === 'completed');
      const upcomingAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate > new Date() && apt.status === 'scheduled';
      });
      const inProgressAppointments = appointments.filter(apt => apt.status === 'in_progress');

      const thisWeekAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= weekStart;
      });

      const noShowAppointments = appointments.filter(apt => apt.status === 'no_show');

      // Calculate completion rate
      const totalFinishedAppointments = completedAppointments.length + noShowAppointments.length;
      const completionRate = totalFinishedAppointments > 0 
        ? (completedAppointments.length / totalFinishedAppointments) * 100 
        : 0;

      // Calculate no-show rate
      const noShowRate = thisWeekAppointments.length > 0 
        ? (noShowAppointments.length / thisWeekAppointments.length) * 100 
        : 0;

      // Calculate average wait time (simplified)
      let avgWaitTime = '12 min';
      if (todayAppointments.length > 1) {
        const intervals = [];
        for (let i = 1; i < todayAppointments.length; i++) {
          const prev = new Date(todayAppointments[i-1].appointment_date);
          const curr = new Date(todayAppointments[i].appointment_date);
          intervals.push((curr.getTime() - prev.getTime()) / (1000 * 60));
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        avgWaitTime = `${Math.round(avgInterval / 2)} min`;
      }

      // Fetch pending access requests
      const { data: pendingRequests } = await supabase
        .from('sharing_permissions')
        .select('id')
        .eq('grantee_id', user.id)
        .eq('status', 'pending');

      return {
        patientsToday: todayAppointments.length,
        completedAppointments: completedAppointments.length,
        upcomingAppointments: upcomingAppointments.length,
        inProgressAppointments: inProgressAppointments.length,
        averageWaitTime: avgWaitTime,
        patientSatisfaction: 92, // This would come from patient feedback
        pendingTasks: pendingRequests?.length || 0,
        totalAppointmentsThisWeek: thisWeekAppointments.length,
        completionRate: Math.round(completionRate),
        noShowRate: Math.round(noShowRate)
      };
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000 // Consider data stale after 30 seconds
  });

  return {
    metrics: metrics || {
      patientsToday: 0,
      completedAppointments: 0,
      upcomingAppointments: 0,
      inProgressAppointments: 0,
      averageWaitTime: '0 min',
      patientSatisfaction: 0,
      pendingTasks: 0,
      totalAppointmentsThisWeek: 0,
      completionRate: 0,
      noShowRate: 0
    },
    isLoading,
    error
  };
};
