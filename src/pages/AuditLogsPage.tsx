
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Clock, Shield, File } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import AuditLogItem, { AuditLogItemProps, AuditLogType } from '@/components/ui/AuditLogItem';
import { useToast } from '@/hooks/use-toast';
import { AuditLogService } from '@/services/AuditLogService';

const AuditLogsPage = () => {
  const { toast } = useToast();
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
    // In a real app, this would fetch from an API with pagination
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

  const handleDownload = () => {
    // In a real app, this would generate a properly formatted audit log export
    // that complies with HIPAA requirements
    
    // Log this administrative action
    AuditLogService.logAdminAction(
      'Exported audit logs',
      'Audit System',
      'success',
      `${filteredLogs.length} logs exported`
    );
    
    toast({
      title: "Export Started",
      description: `${filteredLogs.length} audit logs are being prepared for download.`,
    });
  };

  const getComplianceStatus = () => {
    // A simple way to show compliance status - in a real app this would be more sophisticated
    if (auditLogs.length > 0) {
      return (
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm font-medium">HIPAA Compliant Audit System Active</span>
        </div>
      );
    }
    return (
      <div className="flex items-center">
        <Shield className="h-5 w-5 text-amber-500 mr-2" />
        <span className="text-sm font-medium">No audit records - Compliance at risk</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Audit Logs</h1>
          <p className="text-muted-foreground">
            Complete, immutable record of all system activity
          </p>
          {getComplianceStatus()}
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Last 24 hours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HIPAA Audit Trail</CardTitle>
          <CardDescription>
            Tamper-proof record of all data access, disclosures, and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit logs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All Events" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="access">Access Events</SelectItem>
                  <SelectItem value="disclosure">Disclosures</SelectItem>
                  <SelectItem value="breach">Security Events</SelectItem>
                  <SelectItem value="admin">Admin Actions</SelectItem>
                  <SelectItem value="amendment">Amendments</SelectItem>
                  <SelectItem value="login">Login Events</SelectItem>
                  <SelectItem value="logout">Logout Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <AuditLogItem key={log.id} {...log} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="font-semibold text-lg">No matching audit logs</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
