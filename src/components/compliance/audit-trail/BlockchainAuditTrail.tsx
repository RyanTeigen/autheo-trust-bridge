
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Hash, Clock, ExternalLink, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuditHashManager from './AuditHashManager';
import { BlockchainAnchorService } from '@/services/audit/BlockchainAnchorService';

interface BlockchainAnchor {
  id: string;
  tx_hash: string;
  anchored_at: string;
  audit_hash: string | null;
  log_count: number | null;
  created_at: string;
}

const BlockchainAuditTrail: React.FC = () => {
  const [anchors, setAnchors] = useState<BlockchainAnchor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnchors = async () => {
    try {
      setLoading(true);
      const data = await BlockchainAnchorService.fetchBlockchainAnchors();
      setAnchors(data);
    } catch (error) {
      console.error('Error fetching blockchain anchors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blockchain anchors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnchors();
  }, []);

  return (
    <div className="space-y-6">
      <AuditHashManager onHashAnchored={fetchAnchors} />
      
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blockchain Audit Trail
          </CardTitle>
          <CardDescription>
            Immutable audit log anchors stored on the Autheo blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-autheo-primary mr-2" />
              <span className="text-slate-300">Loading blockchain anchors...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {anchors.length === 0 ? (
                <div className="text-center py-8">
                  <Lock className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No Blockchain Anchors</h3>
                  <p className="text-sm text-slate-400">
                    Generate and anchor audit hashes to create immutable audit trails
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {anchors.map((anchor) => (
                    <div
                      key={anchor.id}
                      className="p-4 border border-slate-700 rounded-lg bg-slate-800/30 hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-autheo-primary" />
                          <span className="text-sm font-medium text-slate-200">
                            Blockchain Anchor
                          </span>
                        </div>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          Confirmed
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {anchor.audit_hash && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Audit Hash:</span>
                            <span className="font-mono text-slate-300 truncate ml-2 max-w-xs">
                              {anchor.audit_hash}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Transaction:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-slate-300 truncate max-w-xs">
                              {anchor.tx_hash}
                            </span>
                            <ExternalLink className="h-3 w-3 text-slate-400" />
                          </div>
                        </div>
                        
                        {anchor.log_count && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Logs Covered:</span>
                            <span className="text-slate-300">{anchor.log_count} entries</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Anchored:</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-slate-300">
                              {new Date(anchor.anchored_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockchainAuditTrail;
