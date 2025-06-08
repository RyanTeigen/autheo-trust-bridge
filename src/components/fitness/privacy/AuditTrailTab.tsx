
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, FileText, Eye, Lock, Database, Clock } from 'lucide-react';
import { FitnessAuditLogEntry } from '@/services/fitness/types';

interface AuditTrailTabProps {
  auditLogs: FitnessAuditLogEntry[];
  loading: boolean;
}

const AuditTrailTab: React.FC<AuditTrailTabProps> = ({ auditLogs, loading }) => {
  const getAuditActionIcon = (action: string) => {
    if (action.includes('encryption')) return <Lock className="h-4 w-4" />;
    if (action.includes('proof')) return <Key className="h-4 w-4" />;
    if (action.includes('consent')) return <FileText className="h-4 w-4" />;
    if (action.includes('dashboard')) return <Eye className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary">HIPAA Audit Trail</CardTitle>
        <CardDescription>
          Complete audit log of all access and modifications to your fitness data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autheo-primary mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading audit logs...</p>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8">
            <Database className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Audit Logs</h3>
            <p className="text-sm text-slate-400">
              Audit logs will appear here as you interact with your fitness data
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="p-3 border border-slate-700 rounded-lg bg-slate-800/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getAuditActionIcon(log.action)}
                    <span className="text-sm font-medium text-slate-200">{log.action}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={
                        log.status === 'success' ? 'text-green-400 border-green-400' :
                        log.status === 'warning' ? 'text-yellow-400 border-yellow-400' :
                        'text-red-400 border-red-400'
                      }
                    >
                      {log.status}
                    </Badge>
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  <p>Resource: {log.resource_type}</p>
                  {log.details && (
                    <p>Details: {JSON.stringify(log.details)}</p>
                  )}
                </div>
              </div>
            ))}
            {auditLogs.length > 10 && (
              <p className="text-xs text-slate-400 text-center">
                ... and {auditLogs.length - 10} more audit entries
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditTrailTab;
