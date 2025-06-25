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
import SmartAnchoringWidget from '../audit-trail/SmartAnchoringWidget';
import RevokedSharesList from '../RevokedSharesList';
import { AuditLogTable } from '../AuditLogTable';

const ComplianceAuditTab: React.FC = () => {
  const [auditStats, setAuditStats] = useState({
    totalLogs: 1247,
    todayLogs: 43,
    securityEvents: 12,
    dataAccess: 156,
    systemChanges: 89
  });

  const { toast } = useToast();

  const handleRunFullAudit = () => {
    toast({
      title: "Full Audit Initiated",
      description: "Comprehensive audit scan is running. This may take several minutes.",
    });
  };

  const handleExportAuditLogs = () => {
    toast({
      title: "Export Started",
      description: "Audit logs are being prepared for download.",
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

      {/* Audit Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Search className="h-5 w-5 text-autheo-primary" />
            Audit Actions
          </CardTitle>
          <CardDescription>
            Run comprehensive audits and export compliance reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleRunFullAudit}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              <Shield className="h-4 w-4 mr-2" />
              Run Full Audit
            </Button>
            <Button
              onClick={handleExportAuditLogs}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export Audit Logs
            </Button>
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
          <AuditLogTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceAuditTab;
