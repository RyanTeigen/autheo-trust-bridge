// Enhanced HIPAA-compliant audit logs API hook
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from '@/services/audit/HIPAAAuditLogger';

export interface EnhancedAuditLog {
  id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  user_id: string | null;
  session_id: string | null;
  ip_address: unknown;
  user_agent: string | null;
  resource_type: string | null;
  resource_id: string | null;
  phi_accessed: boolean;
  action_performed: string;
  details: any;
  before_state: any;
  after_state: any;
  compliance_flags: any;
  created_at: string;
  retention_until: string;
}

export const useEnhancedAuditLogsAPI = () => {
  const [auditLogs, setAuditLogs] = useState<EnhancedAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = async (limit: number = 1000) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('enhanced_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      setAuditLogs(data || []);
      
      // Log the access to audit logs
      await auditLogger.logPHIAccess('audit_logs', 'enhanced_audit_logs', 'view');
      
      return { success: true, data: data || [] };
    } catch (err) {
      console.error('Error fetching enhanced audit logs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch audit logs';
      setError(errorMessage);
      setAuditLogs([]);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogsByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('enhanced_audit_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      console.error('Error fetching audit logs by date range:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch audit logs';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const fetchPHIAccessLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('enhanced_audit_logs')
        .select('*')
        .eq('phi_accessed', true)
        .order('created_at', { ascending: false })
        .limit(500);

      if (fetchError) {
        throw fetchError;
      }

      return { success: true, data: data || [] };
    } catch (err) {
      console.error('Error fetching PHI access logs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch PHI access logs';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = async (startDate: Date, endDate: Date) => {
    try {
      setError(null);

      const result = await fetchAuditLogsByDateRange(startDate, endDate);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch data for export');
      }

      // Create CSV content
      const csvContent = convertToCSV(result.data);
      
      // Download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `hipaa_audit_logs_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log the export action
      await auditLogger.logEvent({
        eventType: 'phi_export',
        severity: 'warning',
        actionPerformed: 'HIPAA audit logs exported',
        details: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          record_count: result.data.length
        },
        complianceFlags: { 
          data_export: true,
          requires_authorization: true,
          hipaa_audit_export: true
        }
      });

      return { success: true, recordCount: result.data.length };
    } catch (err) {
      console.error('Error exporting audit logs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to export audit logs';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const convertToCSV = (data: EnhancedAuditLog[]): string => {
    if (data.length === 0) return '';

    const headers = [
      'Timestamp', 'Event Type', 'Severity', 'User ID', 'Session ID', 
      'IP Address', 'User Agent', 'Resource Type', 'Resource ID',
      'PHI Accessed', 'Action Performed', 'Details', 'Compliance Flags',
      'Before State', 'After State', 'Retention Until'
    ];

    const rows = data.map(log => [
      log.created_at,
      log.event_type,
      log.severity,
      log.user_id || '',
      log.session_id || '',
      log.ip_address || '',
      log.user_agent || '',
      log.resource_type || '',
      log.resource_id || '',
      log.phi_accessed ? 'Yes' : 'No',
      log.action_performed,
      JSON.stringify(log.details || {}),
      JSON.stringify(log.compliance_flags || {}),
      JSON.stringify(log.before_state || {}),
      JSON.stringify(log.after_state || {}),
      log.retention_until
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');
  };

  return {
    auditLogs,
    loading,
    error,
    fetchAuditLogs,
    fetchAuditLogsByDateRange,
    fetchPHIAccessLogs,
    exportAuditLogs
  };
};