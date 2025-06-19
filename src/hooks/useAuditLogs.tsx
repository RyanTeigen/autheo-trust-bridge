
import { useState, useEffect } from 'react';
import { useAuditLogsAPI } from '@/hooks/useAuditLogsAPI';

interface AuditLogEntry {
  id: string;
  type: string;
  action: string;
  timestamp: string;
  user: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'warning' | 'error';
  details?: string;
  ipAddress?: string;
  location?: string;
  browser?: string;
  os?: string;
  duration?: number;
}

export const useAuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('24h');
  const { auditLogs: rawAuditLogs, loading, fetchAuditLogs } = useAuditLogsAPI();

  // Transform the raw audit logs to match the expected format
  const auditLogs: AuditLogEntry[] = rawAuditLogs.map(log => ({
    id: log.id,
    type: log.action.toLowerCase().includes('access') ? 'access' : 
          log.action.toLowerCase().includes('create') ? 'create' :
          log.action.toLowerCase().includes('update') ? 'update' :
          log.action.toLowerCase().includes('delete') ? 'delete' :
          log.action.toLowerCase().includes('login') ? 'login' :
          log.action.toLowerCase().includes('logout') ? 'logout' :
          log.action.toLowerCase().includes('sharing') ? 'disclosure' :
          'admin',
    action: log.action,
    timestamp: log.timestamp,
    user: 'Current User', // We'll need to enhance this with actual user info
    resource: log.resource,
    resourceId: log.resource_id || undefined,
    status: log.status,
    details: log.details || undefined,
    ipAddress: log.ip_address || undefined,
    browser: log.user_agent ? log.user_agent.split(' ')[0] : undefined
  }));

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
