
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Hash, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuditAnchor {
  id: string;
  tx_hash: string;
  anchored_at: string;
  audit_hash: string | null;
  log_count: number | null;
}

const AuditAnchorsWidget: React.FC = () => {
  const [anchors, setAnchors] = useState<AuditAnchor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnchors = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_anchors')
          .select('*')
          .order('anchored_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching audit anchors:', error);
        } else if (data) {
          setAnchors(data);
        }
      } catch (error) {
        console.error('Failed to fetch audit anchors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnchors();
  }, []);

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Blockchain Audit Anchors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-autheo-primary mr-2" />
            <span className="text-slate-300">Loading anchors...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Blockchain Audit Anchors
        </CardTitle>
      </CardHeader>
      <CardContent>
        {anchors.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">No blockchain anchors found yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Audit hashes will appear here once anchored on the blockchain
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {anchors.map((anchor) => (
              <div
                key={anchor.id}
                className="p-3 border border-slate-700 rounded-lg bg-slate-800/30 hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">
                      {new Date(anchor.anchored_at).toLocaleString()}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                    Anchored
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Transaction Hash:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-slate-300 truncate max-w-[150px]">
                        {anchor.tx_hash}
                      </span>
                      <ExternalLink className="h-3 w-3 text-slate-400 cursor-pointer hover:text-autheo-primary" />
                    </div>
                  </div>
                  
                  {anchor.audit_hash && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Audit Hash:</span>
                      <span className="font-mono text-slate-300 truncate max-w-[150px]">
                        {anchor.audit_hash.substring(0, 16)}...
                      </span>
                    </div>
                  )}
                  
                  {anchor.log_count && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Logs Anchored:</span>
                      <span className="text-slate-300">{anchor.log_count} entries</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditAnchorsWidget;
