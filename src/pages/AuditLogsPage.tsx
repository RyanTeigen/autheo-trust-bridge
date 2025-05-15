
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuditLogHeader from '@/components/audit/AuditLogHeader';
import AuditLogFilter from '@/components/audit/AuditLogFilter';
import AuditLogsList from '@/components/audit/AuditLogsList';
import AuditLogDashboard from '@/components/audit/AuditLogDashboard';
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
  
  // Add tab state
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  return (
    <div className="space-y-6">
      <AuditLogHeader 
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        filteredLogsCount={filteredLogs.length}
        auditLogsCount={auditLogs.length}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <AuditLogDashboard logs={filteredLogs} />
        </TabsContent>
        <TabsContent value="logs" className="mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditLogsPage;
