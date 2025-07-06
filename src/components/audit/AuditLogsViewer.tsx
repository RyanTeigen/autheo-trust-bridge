import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Shield, User, FileText, Search, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id: string;
  status: string;
  details: string;
  timestamp: string;
  metadata: any;
  ip_address?: string;
  user_agent?: string;
}

export default function AuditLogsViewer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');

  const fetchAuditLogs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      // Apply filters
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }
      if (resourceFilter !== 'all') {
        query = query.eq('resource', resourceFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [user, actionFilter, resourceFilter]);

  const filteredLogs = logs.filter(log =>
    searchTerm === '' ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    const colorMap: Record<string, string> = {
      'record_created': 'bg-green-900/20 text-green-400 border-green-800',
      'record_shared': 'bg-blue-900/20 text-blue-400 border-blue-800',
      'record_viewed': 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
      'access_revoked': 'bg-red-900/20 text-red-400 border-red-800',
      'CREATE_RECORD': 'bg-green-900/20 text-green-400 border-green-800',
      'GET_RECORD': 'bg-blue-900/20 text-blue-400 border-blue-800',
      'UPDATE_RECORD': 'bg-purple-900/20 text-purple-400 border-purple-800',
      'DELETE_RECORD': 'bg-red-900/20 text-red-400 border-red-800',
    };
    return colorMap[action] || 'bg-slate-900/20 text-slate-400 border-slate-800';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Audit Logs
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px] bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="record_created">Record Created</SelectItem>
              <SelectItem value="record_shared">Record Shared</SelectItem>
              <SelectItem value="record_viewed">Record Viewed</SelectItem>
              <SelectItem value="access_revoked">Access Revoked</SelectItem>
              <SelectItem value="CREATE_RECORD">Create Record</SelectItem>
              <SelectItem value="GET_RECORD">Get Record</SelectItem>
            </SelectContent>
          </Select>

          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-[150px] bg-slate-700 border-slate-600 text-slate-100">
              <SelectValue placeholder="Resource" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="medical_record">Medical Records</SelectItem>
              <SelectItem value="patient">Patients</SelectItem>
              <SelectItem value="sharing_permission">Sharing</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={fetchAuditLogs}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-autheo-primary" />
              <span className="ml-2 text-slate-400">Loading audit logs...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <FileText className="h-6 w-6 mr-2" />
              No audit logs found
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-slate-700/50">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-700/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
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
                      
                      <p className="text-slate-200 mb-2">{log.details}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user_id.substring(0, 8)}...
                        </div>
                        {log.metadata?.hash && (
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Hash: {log.metadata.hash.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                      
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                            View Metadata
                          </summary>
                          <pre className="text-xs text-slate-400 mt-1 bg-slate-700/30 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}