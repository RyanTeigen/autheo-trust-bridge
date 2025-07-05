import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EncryptedAggregate {
  record_type: string;
  encrypted_sum: string;
  encrypted_avg: string;
  encrypted_min: string;
  encrypted_max: string;
  count: number;
  timestamp: string;
}

export function useEncryptedAnalytics() {
  const [data, setData] = useState<EncryptedAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAggregates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the supabase functions.invoke method instead of fetch
        const { data: result, error: funcError } = await supabase.functions.invoke('encrypted_aggregate');

        if (funcError) {
          console.error('Error calling encrypted_aggregate function:', funcError);
          setError(funcError.message || 'Failed to fetch encrypted analytics');
          return;
        }

        setData(result || []);
      } catch (err) {
        console.error('Unexpected error fetching encrypted analytics:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAggregates();
  }, []);

  const refetch = () => {
    const fetchAggregates = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: result, error: funcError } = await supabase.functions.invoke('encrypted_aggregate');

        if (funcError) {
          console.error('Error calling encrypted_aggregate function:', funcError);
          setError(funcError.message || 'Failed to fetch encrypted analytics');
          return;
        }

        setData(result || []);
      } catch (err) {
        console.error('Unexpected error fetching encrypted analytics:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAggregates();
  };

  return { data, loading, error, refetch };
}