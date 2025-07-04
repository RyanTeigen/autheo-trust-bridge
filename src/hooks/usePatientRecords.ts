
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SharedRecord {
  id: string;
  patient_id: string;
  record_type: string;
  encrypted_data: string;
  iv: string;
  created_at: string;
  record_hash: string;
  anchored_at: string;
}

export function usePatientRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<SharedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase.rpc('get_patient_records', {
          current_user_id: user.id,
        });

        if (fetchError) {
          throw fetchError;
        }

        setRecords(data || []);
      } catch (err) {
        console.error('Error fetching patient records:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch records');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user?.id]);

  const refetch = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase.rpc('get_patient_records', {
        current_user_id: user.id,
      });

      if (fetchError) {
        throw fetchError;
      }

      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching patient records:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    records,
    loading,
    error,
    refetch
  };
}
