import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  action: string;
  patient: string;
  time: string;
  type: string;
}

export const useProviderActivity = () => {
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch recent audit logs for this provider
        const { data: auditLogs } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(10);

        // Fetch recent sharing permissions granted to this provider
        const { data: sharingPermissions } = await supabase
          .from('sharing_permissions')
          .select(`
            *,
            patients!inner(
              full_name,
              profiles(first_name, last_name)
            ),
            medical_records!inner(record_type)
          `)
          .eq('grantee_id', user.id)
          .eq('status', 'approved')
          .order('updated_at', { ascending: false })
          .limit(5);

        // Fetch recent appointments
        const { data: appointments } = await supabase
          .from('enhanced_appointments')
          .select(`
            *,
            patients!inner(
              full_name,
              profiles(first_name, last_name)
            )
          `)
          .eq('provider_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(5);

        const activities: Activity[] = [];

        // Process audit logs
        auditLogs?.forEach(log => {
          let action = 'Performed action';
          let type = 'System';
          
          switch(log.action) {
            case 'CREATE_MEDICAL_RECORD':
              action = 'Created medical record';
              type = 'Record';
              break;
            case 'ACCESS_MEDICAL_RECORD':
              action = 'Accessed medical record';
              type = 'Access';
              break;
            case 'UPDATE_MEDICAL_RECORD':
              action = 'Updated medical record';
              type = 'Record';
              break;
            default:
              action = log.action.toLowerCase().replace('_', ' ');
              type = 'System';
          }

          activities.push({
            action,
            patient: 'System Action',
            time: getRelativeTime(new Date(log.timestamp)),
            type
          });
        });

        // Process sharing permissions
        sharingPermissions?.forEach(permission => {
          const patientName = permission.patients?.full_name || 
                             `${permission.patients?.profiles?.[0]?.first_name || ''} ${permission.patients?.profiles?.[0]?.last_name || ''}`.trim() ||
                             'Unknown Patient';
          
          activities.push({
            action: 'Gained access to medical records',
            patient: patientName,
            time: getRelativeTime(new Date(permission.updated_at)),
            type: permission.medical_records?.record_type || 'Record'
          });
        });

        // Process appointments
        appointments?.forEach(apt => {
          const patientName = apt.patients?.full_name || 
                             `${apt.patients?.profiles?.[0]?.first_name || ''} ${apt.patients?.profiles?.[0]?.last_name || ''}`.trim() ||
                             'Unknown Patient';
          
          let action = 'Scheduled appointment';
          if (apt.status === 'completed') {
            action = 'Completed appointment';
          } else if (apt.status === 'cancelled') {
            action = 'Cancelled appointment';
          }

          activities.push({
            action,
            patient: patientName,
            time: getRelativeTime(new Date(apt.updated_at)),
            type: 'Appointment'
          });
        });

        // Sort all activities by time and take the most recent
        const sortedActivities = activities
          .sort((a, b) => {
            // Convert relative time back to comparable format for sorting
            const timeToMinutes = (timeStr: string) => {
              if (timeStr.includes('min')) return parseInt(timeStr);
              if (timeStr.includes('hour')) return parseInt(timeStr) * 60;
              if (timeStr.includes('day')) return parseInt(timeStr) * 1440;
              return 0;
            };
            return timeToMinutes(a.time) - timeToMinutes(b.time);
          })
          .slice(0, 4);

        setRecentActivity(sortedActivities);

      } catch (error) {
        console.error('Error fetching provider activity:', error);
        // Fall back to default empty array
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  return { recentActivity, loading };
};

// Helper function to convert timestamp to relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
}