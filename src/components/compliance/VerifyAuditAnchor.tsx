
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Hash, Upload, Search, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BlockchainAnchorService } from '@/services/audit/BlockchainAnchorService';

interface AuditAnchor {
  id: string;
  tx_hash: string;
  anchored_at: string;
  audit_hash: string | null;
  log_count: number | null;
}

const VerifyAuditAnchor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [manualHash, setManualHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<AuditAnchor | null | 'not-found'>(null);
  const { toast } = useToast();

  const calculateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleVerify = async () => {
    if (!manualHash && !file) {
      toast({
        title: "Input Required",
        description: "Please provide either a hash or upload a file to verify.",
        variant: "destructive"
      });
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      let hashToVerify = manualHash;

      if (file) {
        hashToVerify = await calculateFileHash(file);
        console.log('Calculated hash from file:', hashToVerify);
      }

      // Fetch blockchain anchors
      const anchors = await BlockchainAnchorService.fetchBlockchainAnchors();
      
      // Find matching hash
      const match = anchors.find(anchor => 
        anchor.audit_hash === hashToVerify || 
        anchor.tx_hash === hashToVerify
      );

      setResult(match || 'not-found');

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify audit hash",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleClear = () => {
    setManualHash('');
    setFile(null);
    setResult(null);
  };

  const getBlockchainExplorerUrl = (txHash: string) => {
    // This would be replaced with actual blockchain explorer URL
    return `https://explorer.example.com/tx/${txHash}`;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verify Audit Hash Integrity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/20 border-blue-500/30">
          <Hash className="h-4 w-4" />
          <AlertDescription className="text-blue-200 text-sm">
            Verify the integrity of exported audit logs by checking if their hash has been anchored on the blockchain.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Manual Hash Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Enter SHA-256 Hash
            </label>
            <Input
              type="text"
              placeholder="Paste SHA-256 hash here..."
              value={manualHash}
              onChange={(e) => setManualHash(e.target.value)}
              className="bg-slate-700 border-slate-600 text-slate-200 font-mono text-sm"
              disabled={!!file}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                Or Upload CSV File
              </label>
              <span className="text-xs text-slate-500">Hash will be calculated automatically</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="bg-slate-700 border-slate-600 text-slate-200"
                disabled={!!manualHash}
              />
              {file && (
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <Upload className="h-3 w-3" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleVerify}
              disabled={verifying || (!manualHash && !file)}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              <Search className="h-4 w-4 mr-2" />
              {verifying ? 'Verifying...' : 'Verify Hash'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Results */}
        {result === 'not-found' && (
          <Alert className="bg-red-900/20 border-red-500/30">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              <strong>Hash Not Found:</strong> No matching hash found in blockchain anchors. 
              This could indicate the data has been tampered with or the hash hasn't been anchored yet.
            </AlertDescription>
          </Alert>
        )}

        {result && result !== 'not-found' && (
          <Alert className="bg-green-900/20 border-green-500/30">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-200 space-y-2">
              <div>
                <strong>✅ Hash Verified Successfully</strong>
              </div>
              <div className="space-y-1 text-sm">
                <p>Anchored: {new Date(result.anchored_at).toLocaleString()}</p>
                {result.log_count && (
                  <p>Records: {result.log_count.toLocaleString()} audit log entries</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span>Transaction:</span>
                  <code className="bg-slate-700 px-2 py-1 rounded text-xs">
                    {result.tx_hash.substring(0, 16)}...
                  </code>
                  <a
                    href={getBlockchainExplorerUrl(result.tx_hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-autheo-primary hover:text-autheo-primary/80 inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on Explorer
                  </a>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default VerifyAuditAnchor;
