
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Clock, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnchoredHash {
  id: string;
  record_id: string;
  record_hash: string;
  anchor_tx_url?: string;
  anchored_at: string;
  created_at: string;
}

const BlockchainAnchoringStatus: React.FC = () => {
  const [anchoredHashes, setAnchoredHashes] = useState<AnchoredHash[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockAnchoredHashes: AnchoredHash[] = [
      {
        id: '1',
        record_id: '123e4567-e89b-12d3-a456-426614174000',
        record_hash: 'a1b2c3d4e5f6g7h8',
        anchor_tx_url: 'https://sepolia.etherscan.io/tx/0xa1b2c3d4e5f6g7h8',
        anchored_at: '2024-01-15T10:35:00Z',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        record_id: '123e4567-e89b-12d3-a456-426614174001',
        record_hash: 'b2c3d4e5f6g7h8i9',
        anchor_tx_url: 'https://sepolia.etherscan.io/tx/0xb2c3d4e5f6g7h8i9',
        anchored_at: '2024-01-14T15:20:00Z',
        created_at: '2024-01-14T15:15:00Z'
      },
      {
        id: '3',
        record_id: '123e4567-e89b-12d3-a456-426614174002',
        record_hash: 'c3d4e5f6g7h8i9j0',
        anchor_tx_url: 'https://sepolia.etherscan.io/tx/0xc3d4e5f6g7h8i9j0',
        anchored_at: '2024-01-13T09:45:00Z',
        created_at: '2024-01-13T09:40:00Z'
      }
    ];

    setTimeout(() => {
      setAnchoredHashes(mockAnchoredHashes);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    // In a real implementation, this would refetch from the API
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Status Refreshed",
        description: "Blockchain anchoring status has been updated",
      });
    }, 1000);
  };

  const stats = {
    totalAnchored: anchoredHashes.length,
    last24Hours: anchoredHashes.filter(hash => 
      new Date(hash.anchored_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
    averageAnchorTime: '2.5 minutes'
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-autheo-primary" />
              Blockchain Anchoring Status
              <Badge variant="outline" className="ml-2 text-xs text-amber-400 border-amber-600">
                🎭 Simulation Mode
              </Badge>
            </CardTitle>
            <CardDescription>
              Track cryptographic integrity anchors on the blockchain (simulation mode active)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{stats.totalAnchored}</div>
            <div className="text-sm text-slate-400">Total Anchored</div>
          </div>
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{stats.last24Hours}</div>
            <div className="text-sm text-slate-400">Last 24 Hours</div>
          </div>
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{stats.averageAnchorTime}</div>
            <div className="text-sm text-slate-400">Avg. Anchor Time</div>
          </div>
        </div>

        {/* Recent Anchored Hashes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Blockchain Anchors</h4>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-slate-700/50 h-16 rounded-lg"></div>
              ))}
            </div>
          ) : anchoredHashes.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No anchored hashes found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {anchoredHashes.map((hash) => (
                <div
                  key={hash.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-green-400 border-green-600">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Anchored
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(hash.anchored_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300 truncate">
                      Hash: {hash.record_hash}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      Record: {hash.record_id.slice(0, 8)}...
                    </div>
                  </div>
                  
                  {hash.anchor_tx_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-slate-400 hover:text-slate-200 ml-2"
                    >
                      <a
                        href={hash.anchor_tx_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainAnchoringStatus;
