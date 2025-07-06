import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Share, FileText, Shield } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  resource_id: string | null;
  details: string | null;
  metadata: any;
  status: string | null;
}

export default function PatientAccessLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("audit_logs")
          .select("*")
          .eq("user_id", user.id)
          .in("action", ["record_viewed", "record_created", "record_shared", "access_revoked", "GET_RECORD", "CREATE_RECORD"])
          .order("timestamp", { ascending: false })
          .limit(50);

        if (error) {
          throw error;
        }

        setLogs(data || []);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch audit logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "record_viewed":
      case "GET_RECORD":
        return <Eye className="h-4 w-4" />;
      case "record_created":
      case "CREATE_RECORD":
        return <FileText className="h-4 w-4" />;
      case "record_shared":
        return <Share className="h-4 w-4" />;
      case "access_revoked":
        return <Shield className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    const colorMap: Record<string, string> = {
      'record_viewed': 'bg-blue-900/20 text-blue-400 border-blue-800',
      'GET_RECORD': 'bg-blue-900/20 text-blue-400 border-blue-800',
      'record_created': 'bg-green-900/20 text-green-400 border-green-800',
      'CREATE_RECORD': 'bg-green-900/20 text-green-400 border-green-800',
      'record_shared': 'bg-purple-900/20 text-purple-400 border-purple-800',
      'access_revoked': 'bg-red-900/20 text-red-400 border-red-800',
    };
    return colorMap[action] || 'bg-slate-900/20 text-slate-400 border-slate-800';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-autheo-primary"></div>
            <span className="ml-2 text-slate-400">Loading access logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center py-8 text-red-400">
            Error loading access logs: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Access History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <FileText className="h-6 w-6 mr-2" />
            No access logs found
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-slate-700/50">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-700/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-slate-700/50 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Badge variant="secondary" className={getActionColor(log.action)}>
                          {log.action.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {log.resource}
                        </Badge>
                        {log.status && (
                          <Badge 
                            variant={log.status === 'success' ? 'default' : 'destructive'}
                            className={log.status === 'success' 
                              ? 'bg-green-900/20 text-green-400 border-green-800'
                              : 'bg-red-900/20 text-red-400 border-red-800'
                            }
                          >
                            {log.status}
                          </Badge>
                        )}
                      </div>
                      
                      {log.details && (
                        <p className="text-slate-200 mb-2 text-sm">{log.details}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                        {log.resource_id && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            ID: {log.resource_id.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}