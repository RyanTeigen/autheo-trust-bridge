import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, FileText, Copy, CheckCircle, Link, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface RecordHash {
  id: string;
  hash: string;
  operation: string;
  timestamp: string;
  patient_id: string;
  provider_id: string;
  signer_id: string;
}

interface AnchorStatus {
  id: string;
  anchor_status: string;
  blockchain_tx_hash: string | null;
  anchored_at: string | null;
  queued_at: string;
  retry_count: number;
  error_message: string | null;
}

interface PatientRecordHashCardProps {
  recordId: string;
}

export default function PatientRecordHashCard({ recordId }: PatientRecordHashCardProps) {
  const [hashInfo, setHashInfo] = useState<RecordHash | null>(null);
  const [anchorStatus, setAnchorStatus] = useState<AnchorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHashAndAnchorStatus = async () => {
      try {
        // Fetch record hash
        const { data: hashData, error: hashError } = await supabase
          .from('record_hashes')
          .select('*')
          .eq('record_id', recordId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (hashError) {
          console.error('Error fetching record hash:', hashError);
          return;
        }

        setHashInfo(hashData);

        // Fetch anchor status if hash exists
        if (hashData) {
          const { data: anchorData, error: anchorError } = await supabase
            .from('hash_anchor_queue')
            .select('*')
            .eq('record_id', recordId)
            .order('queued_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (anchorError) {
            console.error('Error fetching anchor status:', anchorError);
          } else {
            setAnchorStatus(anchorData);
          }
        }
      } catch (error) {
        console.error('Error fetching hash and anchor status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHashAndAnchorStatus();
  }, [recordId]);

  const copyToClipboard = async () => {
    if (!hashInfo?.hash) return;
    
    try {
      await navigator.clipboard.writeText(hashInfo.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Hash Copied",
        description: "Record hash copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy hash to clipboard",
        variant: "destructive",
      });
    }
  };

  const getOperationColor = (operation: string) => {
    const colorMap: Record<string, string> = {
      'insert': 'bg-green-900/20 text-green-400 border-green-800',
      'update': 'bg-blue-900/20 text-blue-400 border-blue-800',
      'created': 'bg-green-900/20 text-green-400 border-green-800',
      'updated': 'bg-blue-900/20 text-blue-400 border-blue-800',
    };
    return colorMap[operation.toLowerCase()] || 'bg-slate-900/20 text-slate-400 border-slate-800';
  };

  const getAnchorStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          color: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
          text: 'Pending'
        };
      case 'anchored':
        return {
          icon: <Link className="h-3 w-3" />,
          color: 'bg-green-900/20 text-green-400 border-green-800',
          text: 'Anchored'
        };
      case 'failed':
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          color: 'bg-red-900/20 text-red-400 border-red-800',
          text: 'Failed'
        };
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          color: 'bg-slate-900/20 text-slate-400 border-slate-800',
          text: 'Unknown'
        };
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!hashInfo) {
    return (
      <Card className="bg-slate-800 border-slate-700 border-dashed">
        <CardContent className="flex items-center justify-center py-6">
          <div className="text-center text-slate-400">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No integrity hash available</p>
            <p className="text-xs mt-1">Hash will be generated automatically</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-autheo-primary flex items-center gap-2 text-base">
          <Shield className="h-5 w-5" />
          Record Integrity Hash
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={getOperationColor(hashInfo.operation)}>
                {hashInfo.operation.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                {new Date(hashInfo.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">SHA-256 Hash:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-6 px-2 text-slate-400 hover:text-autheo-primary"
              >
                {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <div className="font-mono text-xs text-slate-200 break-all leading-relaxed">
              {hashInfo.hash}
            </div>
          </div>

          {/* Blockchain Anchoring Status */}
          <div className="bg-slate-700/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Blockchain Status:</span>
              {anchorStatus && (
                <Badge variant="secondary" className={getAnchorStatusDisplay(anchorStatus.anchor_status).color}>
                  <div className="flex items-center gap-1">
                    {getAnchorStatusDisplay(anchorStatus.anchor_status).icon}
                    {getAnchorStatusDisplay(anchorStatus.anchor_status).text}
                  </div>
                </Badge>
              )}
            </div>
            
            {anchorStatus?.blockchain_tx_hash && anchorStatus.anchor_status === 'anchored' && (
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Transaction Hash:</span>
                <div className="font-mono text-xs text-slate-200 break-all bg-slate-800/50 p-2 rounded">
                  {anchorStatus.blockchain_tx_hash}
                </div>
              </div>
            )}
            
            {anchorStatus?.error_message && anchorStatus.anchor_status === 'failed' && (
              <div className="space-y-1">
                <span className="text-xs text-red-400">Error:</span>
                <div className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                  {anchorStatus.error_message}
                </div>
              </div>
            )}
            
            {!anchorStatus && (
              <div className="text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Queuing for blockchain anchoring...
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-700/20 rounded p-2">
              <span className="text-slate-400 block mb-1">Record ID:</span>
              <span className="text-slate-200 font-mono">{recordId.substring(0, 8)}...</span>
            </div>
            <div className="bg-slate-700/20 rounded p-2">
              <span className="text-slate-400 block mb-1">Hash ID:</span>
              <span className="text-slate-200 font-mono">{hashInfo.id.substring(0, 8)}...</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 border-t border-slate-700 pt-3">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            This cryptographic hash ensures your medical record hasn't been tampered with.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}