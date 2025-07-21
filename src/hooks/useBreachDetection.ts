import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BreachEvent {
  id: string;
  user_id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
  auto_detected: boolean;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

export function useBreachDetection() {
  const [breachEvents, setBreachEvents] = useState<BreachEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBreachEvents();
  }, []);

  const fetchBreachEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('breach_detection_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      const transformedData: BreachEvent[] = (data || []).map(event => ({
        ...event,
        severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
        metadata: event.metadata as Record<string, any>
      }));
      setBreachEvents(transformedData);
    } catch (err: any) {
      console.error('Error fetching breach events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resolveBreachEvent = async (eventId: string, resolutionNote?: string) => {
    try {
      const { error: updateError } = await supabase
        .from('breach_detection_events')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', eventId);

      if (updateError) {
        throw updateError;
      }

      // Refresh the data
      await fetchBreachEvents();
    } catch (err: any) {
      console.error('Error resolving breach event:', err);
      throw err;
    }
  };

  const getUnresolvedCount = () => {
    return breachEvents.filter(event => !event.resolved).length;
  };

  const getCriticalCount = () => {
    return breachEvents.filter(event => event.severity === 'critical' && !event.resolved).length;
  };

  return {
    breachEvents,
    loading,
    error,
    refetch: fetchBreachEvents,
    resolveBreachEvent,
    getUnresolvedCount,
    getCriticalCount
  };
}