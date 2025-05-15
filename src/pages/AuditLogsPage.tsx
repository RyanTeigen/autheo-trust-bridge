
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuditLogHeader from '@/components/audit/AuditLogHeader';
import AuditLogFilter from '@/components/audit/AuditLogFilter';
import AuditLogsList from '@/components/audit/AuditLogsList';
import { useAuditLogs } from '@/hooks/useAuditLogs';

const AuditLogsPage = () => {
  const {
    auditLogs,
    filteredLogs,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    timeframe,
    setTimeframe
  } = useAuditLogs();
  
  return (
    <div className="space-y-6">
      <AuditLogHeader 
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        filteredLogsCount={filteredLogs.length}
        auditLogsCount={auditLogs.length}
      />

      <Card>
        <CardHeader>
          <CardTitle>HIPAA Audit Trail</CardTitle>
          <CardDescription>
            Tamper-proof record of all data access, disclosures, and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <AuditLogFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterType={filterType}
              setFilterType={setFilterType}
            />
            
            <AuditLogsList filteredLogs={filteredLogs} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
