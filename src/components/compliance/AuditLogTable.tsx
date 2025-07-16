
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Clock, Globe, User, Download, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resource_id?: string;
  user_id?: string;
  status: 'success' | 'warning' | 'error';
  details?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export function AuditLogTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, actionFilter, startDate, endDate]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      // Transform and type the data properly
      const typedData: AuditLog[] = (data || []).map((log: any) => ({
        ...log,
        status: (log.status === 'success' || log.status === 'warning' || log.status === 'error') 
          ? log.status as 'success' | 'warning' | 'error'
          : 'success' as const
      }));

      setLogs(typedData);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by action
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(endDate + 'T23:59:59'));
    }

    setFilteredLogs(filtered);
  };

  const handleExportToCSV = async () => {
    setExporting(true);
    try {
      const logsToExport = filteredLogs.length > 0 ? filteredLogs : logs;
      
      // Create CSV headers
      const headers = ['Timestamp', 'Action', 'Resource', 'Status', 'Details', 'IP Address', 'User ID'];
      
      // Create CSV rows
      const csvRows = [
        headers.join(','),
        ...logsToExport.map(log => [
          `"${formatTimestamp(log.timestamp)}"`,
          `"${log.action}"`,
          `"${log.resource}"`,
          `"${log.status}"`,
          `"${log.details || 'N/A'}"`,
          `"${log.ip_address || 'N/A'}"`,
          `"${log.user_id || 'N/A'}"`
        ].join(','))
      ];

      // Create and download file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${logsToExport.length} audit log entries to CSV.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export audit logs",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const getUniqueActions = () => {
    const actions = logs.map(log => log.action);
    return [...new Set(actions)].sort();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary">Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-slate-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary">Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-red-900/20 border-red-500/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Audit Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-autheo-primary" />
            <span className="text-sm font-medium text-slate-200">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  {getUniqueActions().map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-300">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Export</label>
              <Button
                onClick={handleExportToCSV}
                disabled={exporting}
                className="w-full bg-autheo-primary hover:bg-autheo-primary/90"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {(actionFilter || startDate || endDate) && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Showing {filteredLogs.length} of {logs.length} entries</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionFilter('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="h-6 px-2 text-xs"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
        {(filteredLogs.length > 0 ? filteredLogs : logs).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No audit logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Action</TableHead>
                  <TableHead className="text-slate-300">Resource</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Timestamp</TableHead>
                  <TableHead className="text-slate-300">IP Address</TableHead>
                  <TableHead className="text-slate-300">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filteredLogs.length > 0 ? filteredLogs : logs).map((log) => (
                  <TableRow key={log.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell className="text-slate-100 font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        {log.action}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-100">
                      <div>
                        <div className="font-medium">{log.resource}</div>
                        {log.resource_id && (
                          <div className="text-sm text-slate-400">
                            ID: {truncateText(log.resource_id, 20)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell className="text-slate-100">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="text-slate-100">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-400" />
                        {log.ip_address || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-100">
                      {log.details ? truncateText(log.details) : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
