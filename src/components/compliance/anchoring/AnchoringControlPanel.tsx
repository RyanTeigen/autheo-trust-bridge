import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Anchor, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAnchoring } from '@/hooks/useAnchoring';
import AnchoringStatusBadge from './AnchoringStatusBadge';

const AnchoringControlPanel: React.FC = () => {
  const { 
    queueEntries, 
    anchoredHashes, 
    isLoading, 
    triggerAnchoring, 
    refreshData 
  } = useAnchoring();

  const pendingCount = queueEntries.filter(entry => entry.anchor_status === 'pending').length;
  const processingCount = queueEntries.filter(entry => entry.anchor_status === 'processing').length;
  const failedCount = queueEntries.filter(entry => entry.anchor_status === 'failed').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            Anchoring Status
          </CardTitle>
          <CardDescription>
            Current status of blockchain anchoring queue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Anchored</span>
              </div>
              <Badge variant="default">{anchoredHashes.length}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <Badge variant="outline">{pendingCount}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Processing</span>
              </div>
              <Badge variant="secondary">{processingCount}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Failed</span>
              </div>
              <Badge variant="destructive">{failedCount}</Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={triggerAnchoring}
              disabled={isLoading || pendingCount === 0}
              className="flex-1"
            >
              <Anchor className="h-4 w-4 mr-2" />
              Trigger Anchoring
            </Button>
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Anchoring Activity</CardTitle>
          <CardDescription>
            Latest anchoring queue entries and completed anchors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {/* Recent anchored hashes */}
            {anchoredHashes.slice(0, 3).map((hash) => (
              <div key={hash.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {hash.hash.slice(0, 16)}...
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {hash.log_count} logs • {hash.blockchain_network || 'Autheo'}
                  </div>
                </div>
                <AnchoringStatusBadge 
                  status="anchored"
                  txHash={hash.blockchain_tx_hash || undefined}
                  anchoredAt={hash.created_at}
                  compact
                />
              </div>
            ))}

            {/* Recent queue entries */}
            {queueEntries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {entry.hash.slice(0, 16)}...
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.log_count} logs • {new Date(entry.queued_at).toLocaleDateString()}
                  </div>
                </div>
                <AnchoringStatusBadge 
                  status={entry.anchor_status as any}
                  errorMessage={entry.error_message}
                  compact
                />
              </div>
            ))}

            {queueEntries.length === 0 && anchoredHashes.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No anchoring activity yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnchoringControlPanel;
