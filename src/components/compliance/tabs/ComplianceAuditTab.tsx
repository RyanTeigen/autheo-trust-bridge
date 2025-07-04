
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Database,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLogsAPI } from '@/hooks/useAuditLogsAPI';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SmartAnchoringWidget from '../audit-trail/SmartAnchoringWidget';
import RevokedSharesList from '../RevokedSharesList';
import ExportAuditLogsButton from '../ExportAuditLogsButton';
import VerifyAuditAnchor from '../VerifyAuditAnchor';
import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  id: string;
  action: string;
  user_id: string | null;
  timestamp: string;
  resource: string;
  resource_id: string | null;
  status: 'success' | 'warning' | 'error';
  details: string | null;
  user_email?: string;
  user_role?: string;
}

const ComplianceAuditTab: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditStats, setAuditStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    securityEvents: 0,
    dataAccess: 0,
    systemChanges: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Fetch audit logs with user profile information
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          user_id,
          timestamp,
          resource,
          resource_id,
          status,
          details
        `)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get user information for each log entry
      const logsWithUserInfo = await Promise.all(
        (logs || []).map(async (log) => {
          if (log.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email, role')
              .eq('id', log.user_id)
              .single();
            
            return {
              ...log,
              user_email: profile?.email || 'Unknown User',
              user_role: profile?.role || 'Unknown Role',
              status: (log.status === 'success' || log.status === 'warning' || log.status === 'error') 
                ? log.status as 'success' | 'warning' | 'error'
                : 'success' as const
            };
          }
          return {
            ...log,
            user_email: 'System',
            user_role: 'System',
            status: (log.status === 'success' || log.status === 'warning' || log.status === 'error') 
              ? log.status as 'success' | 'warning' | 'error'
              : 'success' as const
          };
        })
      );

      setAuditLogs(logsWithUserInfo);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayLogs = logsWithUserInfo.filter(log => 
        new Date(log.timestamp) >= today
      ).length;

      const securityEvents = logsWithUserInfo.filter(log => 
        log.action.toLowerCase().includes('security') ||
        log.action.toLowerCase().includes('login') ||
        log.action.toLowerCase().includes('auth')
      ).length;

      const dataAccess = logsWithUserInfo.filter(log => 
        log.action.toLowerCase().includes('access') ||
        log.action.toLowerCase().includes('view') ||
        log.action.toLowerCase().includes('read')
      ).length;

      const systemChanges = logsWithUserInfo.filter(log => 
        log.action.toLowerCase().includes('create') ||
        log.action.toLowerCase().includes('update') ||
        log.action.toLowerCase().includes('delete')
      ).length;

      setAuditStats({
        totalLogs: logsWithUserInfo.length,
        todayLogs,
        securityEvents,
        dataAccess,
        systemChanges
      });

    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullAudit = () => {
    toast({
      title: "Full Audit Initiated",
      description: "Comprehensive audit scan is running. This may take several minutes.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Audit Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Logs</p>
                <p className="text-2xl font-bold text-slate-200">{auditStats.totalLogs.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Today's Logs</p>
                <p className="text-2xl font-bold text-green-400">{auditStats.todayLogs}</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Security Events</p>
                <p className="text-2xl font-bold text-red-400">{auditStats.securityEvents}</p>
              </div>
              <Shield className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Data Access</p>
                <p className="text-2xl font-bold text-yellow-400">{auditStats.dataAccess}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">System Changes</p>
                <p className="text-2xl font-bold text-purple-400">{auditStats.systemChanges}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Anchoring Widget */}
      <SmartAnchoringWidget useMainnet={false} />

      {/* Audit Hash Verification */}
      <VerifyAuditAnchor />

      {/* Audit Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Search className="h-5 w-5 text-autheo-primary" />
            Audit Actions
          </CardTitle>
          <CardDescription>
            Run comprehensive audits, export compliance reports, and manage audit data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">System Auditing</h4>
              <Button
                onClick={handleRunFullAudit}
                className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
              >
                <Shield className="h-4 w-4 mr-2" />
                Run Full Audit
              </Button>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Data Export & Verification</h4>
              <ExportAuditLogsButton />
              
              <Alert className="mt-3 bg-blue-900/20 border-blue-500/30">
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-blue-200 text-xs">
                  <strong>Integrity Verification:</strong> Each export includes a SHA-256 hash for tamper detection. 
                  Store this hash securely for compliance verification.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revoked Shares List */}
      <RevokedSharesList />

      {/* Recent Audit Logs */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <FileText className="h-5 w-5 text-autheo-primary" />
            Recent Audit Logs
          </CardTitle>
          <CardDescription>
            Latest system activities and security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-slate-700" />
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Action</TableHead>
                    <TableHead className="text-slate-300">Actor</TableHead>
                    <TableHead className="text-slate-300">Target</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id} className="border-slate-700 hover:bg-slate-750">
                      <TableCell className="text-slate-200 font-medium">
                        {log.action}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div>
                          <div className="font-medium">{log.user_email}</div>
                          <div className="text-sm text-slate-400 capitalize">{log.user_role}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div>
                          <div className="font-medium">{log.resource}</div>
                          {log.resource_id && (
                            <div className="text-sm text-slate-400">
                              {log.resource_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            log.status === 'success' ? 'default' : 
                            log.status === 'warning' ? 'secondary' : 
                            'destructive'
                          }
                          className={
                            log.status === 'success' ? 'bg-green-900/20 text-green-400 border-green-800' :
                            log.status === 'warning' ? 'bg-amber-900/20 text-amber-400 border-amber-800' :
                            'bg-red-900/20 text-red-400 border-red-800'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceAuditTab;
