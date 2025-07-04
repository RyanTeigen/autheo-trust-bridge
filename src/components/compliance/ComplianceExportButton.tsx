import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Users, FileText, Clock, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ComplianceExportButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

interface UserComplianceData {
  user_id: string;
  user_email: string;
  user_role: string;
  total_audit_logs: number;
  phi_access_count: number;
  last_access: string;
  compliance_score: number;
  audit_logs: Array<{
    id: string;
    action_performed: string;
    resource_type: string;
    timestamp: string;
    phi_accessed: boolean;
    compliance_flags: any;
    details: any;
  }>;
  sharing_permissions: Array<{
    id: string;
    permission_type: string;
    status: string;
    created_at: string;
    expires_at?: string;
  }>;
  violations: Array<{
    type: string;
    severity: string;
    description: string;
    timestamp: string;
  }>;
}

const ComplianceExportButton: React.FC<ComplianceExportButtonProps> = ({
  className,
  variant = 'default'
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportAllUsers, setExportAllUsers] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [includePersonalData, setIncludePersonalData] = useState(false);
  const [exportStats, setExportStats] = useState<{
    totalUsers: number;
    totalLogs: number;
    phiAccessLogs: number;
    violationsFound: number;
  } | null>(null);

  // Check if user has compliance role
  const hasComplianceRole = profile?.role === 'compliance' || profile?.role === 'admin';

  const fetchComplianceData = async () => {
    if (!hasComplianceRole) {
      toast({
        title: "Access Denied",
        description: "You need compliance or admin role to export compliance data.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (selectedTimeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      let userQuery = supabase.from('profiles').select('id, email, role');
      
      if (!exportAllUsers) {
        userQuery = userQuery.eq('id', user?.id);
      }

      const { data: users, error: usersError } = await userQuery;
      if (usersError) throw usersError;

      const userIds = users?.map(u => u.id) || [];

      // Fetch audit logs for the time range
      const { data: auditLogs, error: logsError } = await supabase
        .from('enhanced_audit_logs')
        .select('*')
        .in('user_id', userIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      // Fetch sharing permissions
      const { data: sharingPermissions, error: sharingError } = await supabase
        .from('sharing_permissions')
        .select('*')
        .in('grantee_id', userIds);

      if (sharingError) throw sharingError;

      // Process data by user
      const complianceData: UserComplianceData[] = (users || []).map(user => {
        const userLogs = auditLogs?.filter(log => log.user_id === user.id) || [];
        const userPermissions = sharingPermissions?.filter(perm => perm.grantee_id === user.id) || [];
        const phiLogs = userLogs.filter(log => log.phi_accessed);
        
        // Calculate compliance score (simplified)
        let score = 100;
        const violations = [];
        
        // Check for potential violations
        const recentPhiAccess = phiLogs.filter(log => {
          const logDate = new Date(log.created_at);
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          return logDate > oneDayAgo;
        });

        if (recentPhiAccess.length > 50) {
          violations.push({
            type: 'excessive_phi_access',
            severity: 'medium',
            description: 'Excessive PHI access in 24 hours',
            timestamp: new Date().toISOString()
          });
          score -= 10;
        }

        const expiredPermissions = userPermissions.filter(perm => 
          perm.expires_at && new Date(perm.expires_at) < new Date()
        );

        if (expiredPermissions.length > 0) {
          violations.push({
            type: 'expired_permissions',
            severity: 'low',
            description: `${expiredPermissions.length} expired permissions not cleaned up`,
            timestamp: new Date().toISOString()
          });
          score -= 5;
        }

        return {
          user_id: user.id,
          user_email: includePersonalData ? user.email : `[REDACTED]`,
          user_role: user.role,
          total_audit_logs: userLogs.length,
          phi_access_count: phiLogs.length,
          last_access: userLogs[0]?.created_at || 'Never',
          compliance_score: Math.max(score, 0),
          audit_logs: userLogs.map(log => ({
            id: log.id,
            action_performed: log.action_performed,
            resource_type: log.resource_type || 'unknown',
            timestamp: log.created_at,
            phi_accessed: log.phi_accessed || false,
            compliance_flags: log.compliance_flags || {},
            details: log.details || {}
          })),
          sharing_permissions: userPermissions.map(perm => ({
            id: perm.id,
            permission_type: perm.permission_type,
            status: perm.status,
            created_at: perm.created_at,
            expires_at: perm.expires_at
          })),
          violations
        };
      });

      setExportStats({
        totalUsers: complianceData.length,
        totalLogs: complianceData.reduce((sum, user) => sum + user.total_audit_logs, 0),
        phiAccessLogs: complianceData.reduce((sum, user) => sum + user.phi_access_count, 0),
        violationsFound: complianceData.reduce((sum, user) => sum + user.violations.length, 0)
      });

      setDialogOpen(true);

      // Store data for export
      (window as any).complianceExportData = complianceData;

    } catch (error) {
      console.error('Error fetching compliance data:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Failed to fetch compliance data',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadComplianceReport = async () => {
    try {
      const complianceData = (window as any).complianceExportData as UserComplianceData[];
      
      const reportMetadata = {
        report_type: 'HIPAA_Compliance_Audit',
        generated_at: new Date().toISOString(),
        generated_by: user?.id,
        time_range: {
          start: selectedTimeRange,
          description: getTimeRangeDescription(selectedTimeRange)
        },
        export_scope: exportAllUsers ? 'all_users' : 'single_user',
        privacy_settings: {
          personal_data_included: includePersonalData,
          data_minimization_applied: !includePersonalData
        },
        compliance_framework: 'HIPAA',
        statistics: exportStats
      };

      const complianceReport = {
        metadata: reportMetadata,
        executive_summary: {
          total_users_audited: exportStats?.totalUsers || 0,
          total_audit_events: exportStats?.totalLogs || 0,
          phi_access_events: exportStats?.phiAccessLogs || 0,
          compliance_violations: exportStats?.violationsFound || 0,
          overall_compliance_score: complianceData.length > 0 ? 
            Math.round(complianceData.reduce((sum, user) => sum + user.compliance_score, 0) / complianceData.length) : 0
        },
        user_compliance_data: complianceData,
        compliance_analysis: {
          high_risk_users: complianceData.filter(user => user.compliance_score < 70),
          excessive_phi_access: complianceData.filter(user => user.phi_access_count > 100),
          expired_permissions: complianceData.filter(user => 
            user.sharing_permissions.some(perm => 
              perm.expires_at && new Date(perm.expires_at) < new Date()
            )
          )
        },
        recommendations: generateComplianceRecommendations(complianceData),
        audit_trail: {
          report_generated_by: user?.id,
          generation_timestamp: new Date().toISOString(),
          export_authorized: hasComplianceRole,
          compliance_officer_signature: 'Digital signature placeholder'
        }
      };

      // Create and download the report
      const blob = new Blob([JSON.stringify(complianceReport, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log the export
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'EXPORT_COMPLIANCE_REPORT',
        resource: 'compliance_data',
        status: 'success',
        details: `Exported compliance report: ${exportStats?.totalLogs} logs from ${exportStats?.totalUsers} users`
      });

      toast({
        title: "Export Successful",
        description: `Compliance report exported with ${exportStats?.totalLogs} audit logs from ${exportStats?.totalUsers} user(s).`,
      });

      setDialogOpen(false);

    } catch (error) {
      console.error('Error generating compliance report:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate compliance report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTimeRangeDescription = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last 1 year';
      default: return 'Custom range';
    }
  };

  const generateComplianceRecommendations = (data: UserComplianceData[]) => {
    const recommendations = [];
    
    const highPhiUsers = data.filter(user => user.phi_access_count > 100);
    if (highPhiUsers.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'access_control',
        description: 'Review users with excessive PHI access',
        affected_users: highPhiUsers.length,
        action: 'Consider implementing additional access controls or monitoring'
      });
    }

    const lowScoreUsers = data.filter(user => user.compliance_score < 70);
    if (lowScoreUsers.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'compliance_training',
        description: 'Users with low compliance scores need additional training',
        affected_users: lowScoreUsers.length,
        action: 'Schedule compliance training sessions'
      });
    }

    return recommendations;
  };

  if (!hasComplianceRole) {
    return null;
  }

  return (
    <div>
      <Button
        variant={variant}
        className={className}
        onClick={fetchComplianceData}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export Compliance Data
          </>
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Export Compliance Report
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Export Configuration */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Export Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time Range</Label>
                    <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="1y">Last 1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="export-all-users"
                        checked={exportAllUsers}
                        onCheckedChange={setExportAllUsers}
                      />
                      <Label htmlFor="export-all-users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Export all users
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-personal-data"
                        checked={includePersonalData}
                        onCheckedChange={setIncludePersonalData}
                      />
                      <Label htmlFor="include-personal-data" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Include personal data (emails)
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Summary */}
            {exportStats && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">Export Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-autheo-primary">
                      {exportStats.totalUsers}
                    </div>
                    <div className="text-sm text-slate-400">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {exportStats.totalLogs}
                    </div>
                    <div className="text-sm text-slate-400">Audit Logs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">
                      {exportStats.phiAccessLogs}
                    </div>
                    <div className="text-sm text-slate-400">PHI Access</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {exportStats.violationsFound}
                    </div>
                    <div className="text-sm text-slate-400">Violations</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy Notice */}
            <Card className="bg-amber-900/20 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-400 mt-1" />
                  <div>
                    <div className="font-medium text-amber-200 mb-2">
                      Compliance Export Notice
                    </div>
                    <p className="text-sm text-amber-200/80 mb-4">
                      This export contains sensitive audit data and compliance information. 
                      Ensure proper handling according to your organization's data governance policies.
                      {!includePersonalData && " Personal data has been redacted for privacy protection."}
                    </p>
                    <Button 
                      onClick={downloadComplianceReport}
                      className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Compliance Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceExportButton;