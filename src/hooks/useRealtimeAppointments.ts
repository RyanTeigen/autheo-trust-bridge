
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RealtimeAppointment {
  id: string;
  patient_id: string;
  provider_id: string;
  appointment_type: string;
  appointment_date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  urgency_level: string;
  clinical_notes?: string;
  access_request_status?: string;
  access_granted_at?: string;
  access_expires_at?: string;
  created_at: string;
  updated_at: string;
  patient_name?: string;
}

export const useRealtimeAppointments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Fetch appointments with React Query
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['provider-appointments', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('enhanced_appointments')
        .select(`
          *,
          patients!inner(
            full_name,
            user_id,
            profiles!inner(first_name, last_name)
          )
        `)
        .eq('provider_id', user.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      return data?.map(apt => ({
        ...apt,
        patient_name: apt.patients?.full_name || 
                    `${apt.patients?.profiles?.first_name || ''} ${apt.patients?.profiles?.last_name || ''}`.trim() ||
                    'Unknown Patient'
      })) || [];
    },
    enabled: !!user,
    refetchInterval: 30000, // Background refresh every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('provider-appointments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enhanced_appointments',
          filter: `provider_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time appointment update:', payload);
          
          // Invalidate and refetch appointments
          queryClient.invalidateQueries({ 
            queryKey: ['provider-appointments', user.id] 
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sharing_permissions',
          filter: `grantee_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time sharing permission update:', payload);
          
          // Invalidate related queries
          queryClient.invalidateQueries({ 
            queryKey: ['provider-appointments', user.id] 
          });
          queryClient.invalidateQueries({ 
            queryKey: ['provider-metrics', user.id] 
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log('Real-time subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [user, queryClient]);

  // Helper functions for filtering appointments
  const getTodayAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate >= today && aptDate < tomorrow;
    });
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate > now && apt.status === 'scheduled';
    });
  };

  const getCompletedAppointments = () => {
    return appointments.filter(apt => apt.status === 'completed');
  };

  const getInProgressAppointments = () => {
    return appointments.filter(apt => apt.status === 'in_progress');
  };

  return {
    appointments,
    isLoading,
    error,
    isConnected,
    todayAppointments: getTodayAppointments(),
    upcomingAppointments: getUpcomingAppointments(),
    completedAppointments: getCompletedAppointments(),
    inProgressAppointments: getInProgressAppointments()
  };
};
