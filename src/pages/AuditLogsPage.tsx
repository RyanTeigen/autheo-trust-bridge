
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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
    setTimeframe,
    loading
  } = useAuditLogs();
  
  const { profile } = useAuth();
  
  // Check if user has compliance role
  const hasComplianceRole = profile?.role === 'compliance' || profile?.role === 'admin';
  
  // Add tab state
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Create properly typed wrapper functions
  const handleTimeframeChange = (value: string) => {
    if (value === '24h' || value === '7d' || value === '30d' || value === 'all') {
      setTimeframe(value);
    }
  };

  const handleFilterTypeChange = (type: string) => {
    if (type === 'all' || type === 'success' || type === 'warning' || type === 'error') {
      setFilterType(type);
    }
  };

  // Transform audit logs to match component expectations
  const transformedLogsForDashboard = filteredLogs.map(log => ({
    type: 'access', // Default type for dashboard
    status: log.status,
    timestamp: log.timestamp
  }));

  const transformedLogsForList = filteredLogs.map(log => ({
    id: log.id,
    type: 'access' as const, // Default type for list
    action: log.action,
    timestamp: log.timestamp,
    user: 'Current User', // Default user
    resource: log.resource,
    resourceId: log.target_id,
    status: log.status,
    details: log.details,
    ipAddress: log.ip_address,
    browser: log.user_agent ? log.user_agent.split(' ')[0] : undefined
  }));
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-autheo-primary" />
          <span className="text-slate-300">Loading audit logs...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <AuditLogHeader 
          timeframe={timeframe}
          setTimeframe={handleTimeframeChange}
          filteredLogsCount={filteredLogs.length}
          auditLogsCount={auditLogs.length}
        />

        {!hasComplianceRole && (
          <Alert className="mb-4 bg-amber-900/20 border-amber-500/30 text-amber-200">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription>
              You are accessing this page with creator privileges. Normally, this page is restricted to users with compliance or admin roles.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 text-slate-300">Dashboard</TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 text-slate-300">Audit Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <AuditLogDashboard logs={transformedLogsForDashboard} />
          </TabsContent>
          <TabsContent value="logs" className="mt-6">
            <Card className="bg-slate-800 border-slate-700 text-slate-100">
              <CardHeader>
                <CardTitle className="text-autheo-primary">HIPAA Audit Trail</CardTitle>
                <CardDescription className="text-slate-300">
                  Tamper-proof record of all data access, disclosures, and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <AuditLogFilter
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filterType={filterType}
                    setFilterType={handleFilterTypeChange}
                  />
                  
                  <AuditLogsList filteredLogs={transformedLogsForList} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuditLogsPage;
