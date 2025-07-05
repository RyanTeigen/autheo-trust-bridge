import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Anchor, Clock, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnchoredLog {
  id: string;
  export_type: string;
  hash: string;
  anchored: boolean;
  anchor_tx_hash: string | null;
  timestamp: string;
  initiated_by: string;
}

const AnchoredLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<AnchoredLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnchoredLogs();
  }, []);

  const fetchAnchoredLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('anchored_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching anchored logs:', error);
        toast({
          title: "Error",
          description: "Failed to fetch anchored logs",
          variant: "destructive"
        });
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Anchor className="h-5 w-5" />
          Export & Anchoring History
        </CardTitle>
        <CardDescription>
          Track audit log exports and blockchain anchoring status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autheo-primary mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading anchored logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <Hash className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Export History</h3>
            <p className="text-sm text-slate-400">
              Export history will appear here after audit log exports
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-slate-700">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Timestamp
                  </TableHead>
                  <TableHead className="text-slate-300">
                    <Hash className="h-4 w-4 inline mr-2" />
                    Hash (Truncated)
                  </TableHead>
                  <TableHead className="text-slate-300">Export Type</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Blockchain Tx</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="border-slate-700">
                    <TableCell className="text-slate-300">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-mono text-autheo-primary text-sm">
                      {truncateHash(log.hash)}
                    </TableCell>
                    <TableCell className="text-slate-300 capitalize">
                      {log.export_type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={log.anchored ? "default" : "secondary"}
                        className={
                          log.anchored 
                            ? "bg-green-600 text-white" 
                            : "bg-yellow-600 text-white"
                        }
                      >
                        {log.anchored ? "Anchored" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 font-mono text-sm">
                      {log.anchor_tx_hash ? truncateHash(log.anchor_tx_hash) : "—"}
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
};

export default AnchoredLogsTable;