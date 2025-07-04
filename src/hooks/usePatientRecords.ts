
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SharedRecord {
  id: string;
  patient_id: string;
  provider_id: string;
  type: string;
  value: string;
  unit: string;
  recorded_at: string;
}

export const usePatientRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<SharedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientRecords = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Call the Supabase function to get shared patient records
      const { data: sharedRecords, error: fetchError } = await supabase
        .rpc('get_patient_records', { current_user_id: user.id });

      if (fetchError) {
        throw fetchError;
      }

      setRecords(sharedRecords || []);
    } catch (err) {
      console.error('Error fetching patient records:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPatientRecords();
    }
  }, [user]);

  const refetch = () => {
    fetchPatientRecords();
  };

  return {
    records,
    loading,
    error,
    refetch
  };
};
