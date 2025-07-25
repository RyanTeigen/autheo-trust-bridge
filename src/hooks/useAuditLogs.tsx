
import { useState, useEffect } from 'react';
import { useAuditLogsAPI } from '@/hooks/useAuditLogsAPI';
import { AuditLogEntry as UIAuditLogEntry, AuditLogType } from '@/services/audit/AuditLogEntry';

export const useAuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('24h');
  const { auditLogs: rawAuditLogs, loading, fetchAuditLogs } = useAuditLogsAPI();

  // Transform the raw audit logs to match the UI expected format
  const auditLogs: UIAuditLogEntry[] = rawAuditLogs.map(log => {
    // Determine the type based on action
    let type: AuditLogType = 'admin';
    if (log.action.toLowerCase().includes('access')) type = 'access';
    else if (log.action.toLowerCase().includes('create')) type = 'access';
    else if (log.action.toLowerCase().includes('update')) type = 'amendment';
    else if (log.action.toLowerCase().includes('delete')) type = 'access';
    else if (log.action.toLowerCase().includes('login')) type = 'login';
    else if (log.action.toLowerCase().includes('logout')) type = 'logout';
    else if (log.action.toLowerCase().includes('sharing')) type = 'disclosure';
    else if (log.action.toLowerCase().includes('breach')) type = 'breach';

    // Ensure status is properly typed
    let status: 'success' | 'warning' | 'error' = 'success';
    if (['success', 'warning', 'error'].includes(log.status)) {
      status = log.status as 'success' | 'warning' | 'error';
    }

    return {
      id: log.id,
      type,
      action: log.action,
      timestamp: log.timestamp,
      user: 'Current User', // We'll need to enhance this with actual user info
      resource: log.resource,
      resourceId: log.resource_id || undefined,
      status,
      details: log.details || undefined,
      ipAddress: log.ip_address || undefined,
      browser: log.user_agent ? log.user_agent.split(' ')[0] : undefined
    };
  });

  // Filter logs based on search query, type, and timeframe
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      searchQuery === '' || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = filterType === 'all' || log.type === filterType;
    
    // Apply timeframe filter
    const logDate = new Date(log.timestamp);
    const now = new Date();
    
    let matchesTimeframe = true;
    if (timeframe === '24h') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      matchesTimeframe = logDate >= yesterday;
    } else if (timeframe === '7d') {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      matchesTimeframe = logDate >= lastWeek;
    } else if (timeframe === '30d') {
      const lastMonth = new Date(now);
      lastMonth.setDate(now.getDate() - 30);
      matchesTimeframe = logDate >= lastMonth;
    }
    
    return matchesSearch && matchesType && matchesTimeframe;
  });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return {
    auditLogs,
    filteredLogs,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    timeframe,
    setTimeframe,
    loading
  };
};

export default useAuditLogs;
