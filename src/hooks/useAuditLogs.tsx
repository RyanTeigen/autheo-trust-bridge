
import { useState, useEffect } from 'react';
import { AuditLogItemProps } from '@/components/ui/AuditLogItem';
import { AuditLogService } from '@/services/AuditLogService';

export const useAuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('24h');
  const [auditLogs, setAuditLogs] = useState<AuditLogItemProps[]>([]);

  // Load audit logs on component mount
  useEffect(() => {
    // Log the access to the audit logs page itself
    AuditLogService.logAdminAction(
      'Viewed audit logs',
      'Audit Logs Page',
      'success'
    );
    
    // Get the logs from our service
    const logs = AuditLogService.getLogs();
    setAuditLogs(logs);

    // If no logs exist yet in our mock system, add some sample logs
    if (logs.length === 0) {
      // Add some sample audit logs for demonstration
      AuditLogService.logPatientAccess('PAT001', 'John Smith', 'Viewed patient record', 'success');
      AuditLogService.logPatientAccess('PAT002', 'Maria Garcia', 'Updated medication list', 'success');
      AuditLogService.logDisclosure('PAT003', 'Robert Johnson', 'Dr. Williams', 'Referral for specialist consultation');
      AuditLogService.logAmendment('PAT001', 'John Smith', 'Allergy List', 'None', 'Penicillin');
      AuditLogService.logSecurityEvent('login', 'User login', 'success');
      AuditLogService.logSecurityEvent('login', 'Failed login attempt', 'error', '3 incorrect password attempts');
      AuditLogService.logAdminAction('Updated system settings', 'Retention Policy', 'success');
      
      // Update our state with the newly created logs
      setAuditLogs(AuditLogService.getLogs());
    }
  }, []);

  // Filter logs based on search query, type, and timeframe
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      searchQuery === '' || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = filterType === 'all' || log.type === filterType;
    
    // Apply timeframe filter - this would be more sophisticated in a real app
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

  return {
    auditLogs,
    filteredLogs,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    timeframe,
    setTimeframe
  };
};

export default useAuditLogs;
