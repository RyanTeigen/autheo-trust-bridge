import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Shield, Clock, Hash, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnchoredRecord {
  id: string;
  record_id: string;
  hash: string;
  anchor_status: string;
  blockchain_tx_hash: string | null;
  queued_at: string;
  anchored_at: string | null;
  retry_count: number;
  error_message: string | null;
}

export default function BlockchainVerificationTab() {
  const [records, setRecords] = useState<AnchoredRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnchoredRecords();
  }, []);

  async function fetchAnchoredRecords() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('hash_anchor_queue')
        .select('*')
        .order('queued_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        throw fetchError;
      }

      setRecords(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch records';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const getExplorerUrl = (txHash: string, useMainnet: boolean = false): string => {
    const baseUrl = useMainnet 
      ? 'https://explorer.autheo.io' 
      : 'https://testnet-explorer.autheo.io';
    return `${baseUrl}/tx/${txHash}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'anchored':
        return 'default'; // Success green
      case 'pending':
        return 'secondary'; // Gray
      case 'failed':
        return 'destructive'; // Red
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'anchored':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Blockchain Verification</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading verification records...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Blockchain Verification</h2>
        </div>
        <Button onClick={fetchAnchoredRecords} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {error && (
        <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {records.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No blockchain anchoring records found.
              <br />
              Records will appear here once medical data is anchored to the Autheo blockchain.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id} className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {getStatusIcon(record.anchor_status)}
                  Medical Record Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Record ID:</span>
                    <div className="font-mono text-xs break-all bg-muted/50 p-2 rounded">
                      {record.record_id}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Hash:</span>
                    <div className="font-mono text-xs break-all bg-muted/50 p-2 rounded flex items-center gap-2">
                      <Hash className="h-3 w-3 flex-shrink-0" />
                      {record.hash}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge 
                      variant={getStatusBadgeVariant(record.anchor_status)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(record.anchor_status)}
                      {record.anchor_status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Queued:</span>
                    <span className="text-sm">{formatTimestamp(record.queued_at)}</span>
                  </div>

                  {record.anchored_at && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Anchored:</span>
                      <span className="text-sm">{formatTimestamp(record.anchored_at)}</span>
                    </div>
                  )}

                  {record.retry_count > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Retries:</span>
                      <Badge variant="outline" className="text-xs">
                        {record.retry_count}
                      </Badge>
                    </div>
                  )}
                </div>

                {record.blockchain_tx_hash && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => window.open(getExplorerUrl(record.blockchain_tx_hash!), '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on Autheo Explorer
                    </Button>
                  </div>
                )}

                {record.error_message && (
                  <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {record.error_message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Medical records are automatically queued for blockchain anchoring to ensure immutable audit trails. 
          The Autheo blockchain provides cryptographic proof of data integrity and timestamp verification.
        </AlertDescription>
      </Alert>
    </div>
  );
}