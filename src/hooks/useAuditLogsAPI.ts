
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';

interface SupabaseAuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  status: string;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  status: 'success' | 'warning' | 'error';
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export const useAuditLogsAPI = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { logAccess, logError } = useAuditLog();

  const fetchAuditLogs = async (limit: number = 100, offset: number = 0) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching audit logs:', error);
        await logError('FETCH_AUDIT_LOGS', 'audit_logs', error.message);
        return { success: false, error: error.message };
      }

      // Transform and type the data properly
      const typedData: AuditLogEntry[] = (data || []).map((log: SupabaseAuditLogEntry) => ({
        ...log,
        status: (log.status === 'success' || log.status === 'warning' || log.status === 'error') 
          ? log.status as 'success' | 'warning' | 'error'
          : 'success' as const
      }));

      setAuditLogs(typedData);
      await logAccess('audit_logs', undefined, `Retrieved ${typedData.length} audit log entries`);
      
      return { success: true, data: typedData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching audit logs:', error);
      await logError('FETCH_AUDIT_LOGS', 'audit_logs', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getAuditLogsByResource = async (resource: string, resourceId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('resource', resource)
        .order('timestamp', { ascending: false });

      if (resourceId) {
        query = query.eq('resource_id', resourceId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs by resource:', error);
        await logError('FETCH_AUDIT_LOGS_BY_RESOURCE', 'audit_logs', error.message);
        return { success: false, error: error.message };
      }

      // Transform and type the data properly
      const typedData: AuditLogEntry[] = (data || []).map((log: SupabaseAuditLogEntry) => ({
        ...log,
        status: (log.status === 'success' || log.status === 'warning' || log.status === 'error') 
          ? log.status as 'success' | 'warning' | 'error'
          : 'success' as const
      }));

      return { success: true, data: typedData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching audit logs by resource:', error);
      await logError('FETCH_AUDIT_LOGS_BY_RESOURCE', 'audit_logs', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getAuditLogsByAction = async (action: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action', action)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching audit logs by action:', error);
        await logError('FETCH_AUDIT_LOGS_BY_ACTION', 'audit_logs', error.message);
        return { success: false, error: error.message };
      }

      // Transform and type the data properly
      const typedData: AuditLogEntry[] = (data || []).map((log: SupabaseAuditLogEntry) => ({
        ...log,
        status: (log.status === 'success' || log.status === 'warning' || log.status === 'error') 
          ? log.status as 'success' | 'warning' | 'error'
          : 'success' as const
      }));

      return { success: true, data: typedData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching audit logs by action:', error);
      await logError('FETCH_AUDIT_LOGS_BY_ACTION', 'audit_logs', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return {
    auditLogs,
    loading,
    fetchAuditLogs,
    getAuditLogsByResource,
    getAuditLogsByAction
  };
};
