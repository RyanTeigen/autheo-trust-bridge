import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Shield, 
  Download, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  AlertTriangle, 
  Eye,
  FileText,
  User,
  Clock,
  Database,
  Activity,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedAuditLogsAPI } from '@/hooks/useEnhancedAuditLogsAPI';
import { cn } from '@/lib/utils';

const HIPAAAuditLogsPage = () => {
  const { profile } = useAuth();
  const { auditLogs, loading, error, fetchAuditLogs, fetchPHIAccessLogs, exportAuditLogs } = useEnhancedAuditLogsAPI();
  
  // State for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [phiFilter, setPhiFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if user has compliance access
  const hasComplianceAccess = profile?.role === 'admin' || profile?.role === 'compliance' || profile?.role === 'auditor';

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Filter logs based on search and filters
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.action_performed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.resource_type && log.resource_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.user_id && log.user_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesEventType = eventTypeFilter === 'all' || log.event_type === eventTypeFilter;
    const matchesPHI = phiFilter === 'all' || 
      (phiFilter === 'yes' && log.phi_accessed) ||
      (phiFilter === 'no' && !log.phi_accessed);
    
    const matchesDateRange = !dateRange.from || !dateRange.to ||
      (new Date(log.created_at) >= dateRange.from && new Date(log.created_at) <= dateRange.to);
    
    return matchesSearch && matchesSeverity && matchesEventType && matchesPHI && matchesDateRange;
  });

  // Calculate statistics
  const stats = {
    total: filteredLogs.length,
    phiAccess: filteredLogs.filter(log => log.phi_accessed).length,
    critical: filteredLogs.filter(log => log.severity === 'critical').length,
    errors: filteredLogs.filter(log => log.severity === 'error').length,
    warnings: filteredLogs.filter(log => log.severity === 'warning').length
  };

  const handleExport = async () => {
    if (!dateRange.from || !dateRange.to) {
      alert('Please select a date range for export');
      return;
    }
    
    const result = await exportAuditLogs(dateRange.from, dateRange.to);
    if (result.success) {
      alert(`Successfully exported ${result.recordCount} audit log records`);
    } else {
      alert(`Export failed: ${result.error}`);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'info': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'login':
      case 'logout':
        return <User className="h-4 w-4" />;
      case 'phi_access':
      case 'phi_create':
      case 'phi_update':
      case 'phi_delete':
        return <Eye className="h-4 w-4" />;
      case 'system_access':
        return <Database className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (!hasComplianceAccess) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-4xl">
          <Alert className="border-destructive/50 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Access denied. This page requires admin, compliance, or auditor privileges to view HIPAA audit logs.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              HIPAA Audit Logs
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive audit trail for HIPAA compliance and security monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchAuditLogs()}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              disabled={!dateRange.from || !dateRange.to}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">PHI Access</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.phiAccess}</p>
                </div>
                <Eye className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Errors</p>
                  <p className="text-2xl font-bold text-red-500">{stats.errors}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search actions, resources, users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="phi_access">PHI Access</SelectItem>
                    <SelectItem value="phi_create">PHI Create</SelectItem>
                    <SelectItem value="phi_update">PHI Update</SelectItem>
                    <SelectItem value="phi_delete">PHI Delete</SelectItem>
                    <SelectItem value="system_access">System Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">PHI Accessed</label>
                <Select value={phiFilter} onValueChange={setPhiFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All records" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="yes">PHI Accessed</SelectItem>
                    <SelectItem value="no">No PHI Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                      numberOfMonths={2}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Log Entries ({filteredLogs.length})</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {auditLogs.length} total audit log entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading audit logs...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No audit logs found</h3>
                <p>Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getEventTypeIcon(log.event_type)}
                          <span className="font-medium">{log.action_performed}</span>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity.toUpperCase()}
                          </Badge>
                          {log.phi_accessed && (
                            <Badge variant="destructive">PHI</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            <span>Event: {log.event_type}</span>
                            {log.resource_type && (
                              <span>Resource: {log.resource_type}</span>
                            )}
                            {log.user_id && (
                              <span>User: {log.user_id.slice(0, 8)}...</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                            </span>
                            {log.ip_address && (
                              <span>IP: {log.ip_address.toString()}</span>
                            )}
                          </div>
                        </div>
                        
                        {log.details && Object.keys(log.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-sm font-medium cursor-pointer hover:text-primary">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HIPAAAuditLogsPage;