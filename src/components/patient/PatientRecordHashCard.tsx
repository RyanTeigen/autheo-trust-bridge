import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, FileText, Copy, CheckCircle } from 'lucide-react';
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

interface PatientRecordHashCardProps {
  recordId: string;
}

export default function PatientRecordHashCard({ recordId }: PatientRecordHashCardProps) {
  const [hashInfo, setHashInfo] = useState<RecordHash | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHash = async () => {
      try {
        const { data, error } = await supabase
          .from('record_hashes')
          .select('*')
          .eq('record_id', recordId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching record hash:', error);
          return;
        }

        setHashInfo(data);
      } catch (error) {
        console.error('Error fetching hash:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHash();
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