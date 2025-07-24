import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProviderMetricsType {
  patientsToday: number;
  completedAppointments: number;
  upcomingAppointments: number;
  averageWaitTime: string;
  patientSatisfaction: number;
  pendingTasks: number;
}

interface AppointmentType {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: string;
}

interface PatientType {
  id: string;
  name: string;
  lastVisit: string;
  reason: string;
}

export const useProviderMetrics = () => {
  const [metrics, setMetrics] = useState<ProviderMetricsType>({
    patientsToday: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    averageWaitTime: '0 min',
    patientSatisfaction: 0,
    pendingTasks: 0
  });
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [recentPatients, setRecentPatients] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch appointments for today and upcoming
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: appointmentsData } = await supabase
          .from('enhanced_appointments')
          .select(`
            *,
            patients!inner(
              full_name,
              user_id,
              profiles(first_name, last_name)
            )
          `)
          .eq('provider_id', user.id)
          .order('appointment_date', { ascending: true });

        // Process appointments
        const todayAppointments = appointmentsData?.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= today && aptDate < tomorrow;
        }) || [];

        const upcomingAppointments = appointmentsData?.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= tomorrow;
        }) || [];

        const completedAppointments = appointmentsData?.filter(apt => 
          apt.status === 'completed'
        ) || [];

        // Format appointments for display
        const formattedAppointments: AppointmentType[] = (appointmentsData || [])
          .slice(0, 10)
          .map(apt => ({
            id: apt.id,
            patientName: apt.patients?.full_name || 
                       `${apt.patients?.profiles?.[0]?.first_name || ''} ${apt.patients?.profiles?.[0]?.last_name || ''}`.trim() ||
                       'Unknown Patient',
            time: new Date(apt.appointment_date).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            type: apt.appointment_type || 'General',
            status: apt.status || 'scheduled'
          }));

        // Fetch recent patients who have shared records with this provider
        const { data: sharedRecords } = await supabase
          .from('sharing_permissions')
          .select(`
            patient_id,
            updated_at,
            patients!inner(
              full_name,
              user_id,
              profiles(first_name, last_name)
            ),
            medical_records!inner(record_type)
          `)
          .eq('grantee_id', user.id)
          .eq('status', 'approved')
          .order('updated_at', { ascending: false })
          .limit(10);

        // Format recent patients
        const formattedPatients: PatientType[] = [];
        const patientMap = new Map();

        sharedRecords?.forEach(record => {
          const patientId = record.patient_id;
          if (!patientMap.has(patientId)) {
            const patientName = record.patients?.full_name || 
                              `${record.patients?.profiles?.[0]?.first_name || ''} ${record.patients?.profiles?.[0]?.last_name || ''}`.trim() ||
                              'Unknown Patient';
            
            patientMap.set(patientId, {
              id: patientId,
              name: patientName,
              lastVisit: new Date(record.updated_at).toLocaleDateString(),
              reason: record.medical_records?.record_type || 'Record Access'
            });
          }
        });

        const recentPatientsArray = Array.from(patientMap.values()).slice(0, 6);

        // Fetch pending access requests (these are "tasks")
        const { data: pendingRequests } = await supabase
          .from('sharing_permissions')
          .select('id')
          .eq('grantee_id', user.id)
          .eq('status', 'pending');

        // Calculate average wait time (simplified - based on appointment intervals)
        let avgWaitTime = '12 min'; // Default
        if (todayAppointments.length > 1) {
          // Simple calculation based on appointment spacing
          const intervals = [];
          for (let i = 1; i < todayAppointments.length; i++) {
            const prev = new Date(todayAppointments[i-1].appointment_date);
            const curr = new Date(todayAppointments[i].appointment_date);
            intervals.push((curr.getTime() - prev.getTime()) / (1000 * 60)); // minutes
          }
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          avgWaitTime = `${Math.round(avgInterval / 2)} min`; // Rough wait time estimate
        }

        setMetrics({
          patientsToday: todayAppointments.length,
          completedAppointments: completedAppointments.length,
          upcomingAppointments: upcomingAppointments.length,
          averageWaitTime: avgWaitTime,
          patientSatisfaction: 92, // This would come from a patient feedback system
          pendingTasks: pendingRequests?.length || 0
        });

        setAppointments(formattedAppointments);
        setRecentPatients(recentPatientsArray);

      } catch (error) {
        console.error('Error fetching provider data:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  return {
    metrics,
    appointments,
    recentPatients,
    loading
  };
};
