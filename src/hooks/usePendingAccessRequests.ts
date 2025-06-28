
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PendingAccessRequest {
  id: string;
  grantee_id: string;
  medical_record_id: string;
  permission_type: string;
  created_at: string;
  status: string;
  provider_name?: string;
  provider_email?: string;
  record_type?: string;
}

export const usePendingAccessRequests = () => {
  const [requests, setRequests] = useState<PendingAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      
      // Get current user - this should work with the fixed RLS policies
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        setRequests([]);
        return;
      }

      // Get patient record - this should work with the fixed RLS policies
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (patientError) {
        console.error('Patient lookup error:', patientError);
        toast({
          title: "Error",
          description: "Failed to load patient information",
          variant: "destructive",
        });
        return;
      }

      if (!patient) {
        console.log('No patient record found');
        setRequests([]);
        return;
      }

      // Fetch pending access requests with provider information
      const { data: pendingRequests, error } = await supabase
        .from('sharing_permissions')
        .select(`
          id,
          grantee_id,
          medical_record_id,
          permission_type,
          created_at,
          status,
          medical_records!inner(
            record_type
          )
        `)
        .eq('patient_id', patient.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending requests:', error);
        toast({
          title: "Error",
          description: "Failed to load pending access requests",
          variant: "destructive",
        });
        return;
      }

      // Fetch provider information for each request
      const requestsWithProviders = await Promise.all(
        (pendingRequests || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', request.grantee_id)
            .maybeSingle();

          return {
            ...request,
            provider_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Provider' : 'Unknown Provider',
            provider_email: profile?.email || 'Unknown',
            record_type: (request as any).medical_records?.record_type || 'Unknown'
          };
        })
      );

      setRequests(requestsWithProviders);
    } catch (error: any) {
      console.error('Error in fetchPendingRequests:', error);
      toast({
        title: "Error",
        description: "Failed to load pending access requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return {
    requests,
    loading,
    refetch: fetchPendingRequests
  };
};
