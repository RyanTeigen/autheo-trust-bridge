
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { decryptWithKey } from '@/utils/atomicDecryption';

interface GraphDataPoint {
  label: string;
  value: number;
}

export const useAtomicVitalsGraph = (dataType: string) => {
  const [data, setData] = useState<GraphDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAndFormatVitals = async () => {
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: rawData, error: fetchError } = await supabase
          .from('atomic_data_points')
          .select('created_at, enc_value')
          .eq('owner_id', user.id)
          .eq('data_type', dataType)
          .order('created_at', { ascending: true })
          .limit(20); // Limit to recent 20 data points

        if (fetchError) {
          console.error('Failed to fetch vitals data:', fetchError);
          setError('Failed to fetch vitals data');
          return;
        }

        if (!rawData || rawData.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        const encryptionKey = localStorage.getItem('userEncryptionKey') || 
                             localStorage.getItem(`encryption_key_${user.id}`);

        if (!encryptionKey) {
          setError('Encryption key not found');
          return;
        }

        const formattedData = rawData.map((row) => ({
          label: new Date(row.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          value: Number(decryptWithKey(row.enc_value, encryptionKey)),
        }));

        setData(formattedData);
      } catch (err) {
        console.error('Error processing vitals data:', err);
        setError('Error processing vitals data');
      } finally {
        setLoading(false);
      }
    };

    fetchAndFormatVitals();
  }, [dataType, user]);

  return { data, loading, error };
};
