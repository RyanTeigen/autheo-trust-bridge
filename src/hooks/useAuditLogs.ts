
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error';
  details?: string;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, any> | null;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  phi_accessed?: boolean;
  minimum_necessary_justification?: string;
  access_purpose?: string;
  data_categories?: string[];
  retention_period?: string;
}

type TimeframeType = '24h' | '7d' | '30d' | 'all';
type FilterType = 'all' | 'success' | 'warning' | 'error';

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [timeframe, setTimeframe] = useState<TimeframeType>('7d');

  useEffect(() => {
    fetchAuditLogs();
  }, [timeframe]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply timeframe filter
      if (timeframe !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (timeframe) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('timestamp', startDate.toISOString());
      }

      const { data, error: fetchError } = await query.limit(1000);

      if (fetchError) {
        throw fetchError;
      }

      // Transform and type-check the data
      const transformedData: AuditLog[] = (data || []).map(log => ({
        id: log.id,
        user_id: log.user_id,
        action: log.action,
        resource: log.resource,
        status: ['success', 'warning', 'error'].includes(log.status) 
          ? log.status as 'success' | 'warning' | 'error'
          : 'success', // Default fallback
        details: log.details,
        target_type: log.target_type,
        target_id: log.target_id,
        metadata: log.metadata ? 
          (typeof log.metadata === 'object' ? log.metadata as Record<string, any> : null) : 
          null,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        timestamp: log.timestamp,
        phi_accessed: log.phi_accessed,
        minimum_necessary_justification: log.minimum_necessary_justification,
        access_purpose: log.access_purpose,
        data_categories: log.data_categories,
        retention_period: log.retention_period as string
      }));

      setAuditLogs(transformedData);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    // Apply status filter
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.status === filterType);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(query) ||
        log.resource.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query) ||
        log.target_type?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [auditLogs, filterType, searchQuery]);

  return {
    auditLogs,
    filteredLogs,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    timeframe,
    setTimeframe,
    refetch: fetchAuditLogs
  };
}
