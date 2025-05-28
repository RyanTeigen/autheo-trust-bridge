
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FitnessDataItem {
  id: string;
  data_type: string;
  external_id: string;
  data: any;
  recorded_at: string;
  synced_at: string;
  integration: {
    device_type: string;
  };
}

export const useFitnessData = () => {
  const [fitnessData, setFitnessData] = useState<FitnessDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFitnessData = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('fitness_data')
        .select(`
          *,
          fitness_integrations!inner(device_type)
        `)
        .eq('user_id', user.user.id)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        integration: {
          device_type: item.fitness_integrations.device_type
        }
      })) || [];

      setFitnessData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching fitness data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFitnessData();
  }, []);

  return {
    fitnessData,
    loading,
    error,
    refetch: fetchFitnessData
  };
};
