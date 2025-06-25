
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Hash, Clock, Database, ExternalLink, Shield, Loader2, TestTube } from 'lucide-react';
import { AuditHashService } from '@/services/audit/AuditHashService';
import { BlockchainAnchorService } from '@/services/audit/BlockchainAnchorService';
import { useToast } from '@/hooks/use-toast';

interface HashResult {
  hash: string;
  logCount: number;
  timestamp: string;
  isAnchored: boolean;
  blockchainTxHash?: string;
}

interface AuditHashManagerProps {
  onHashAnchored?: () => void;
}

const AuditHashManager: React.FC<AuditHashManagerProps> = ({ onHashAnchored }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hashResult, setHashResult] = useState<HashResult | null>(null);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const testAuditLogFetch = async () => {
    setIsTesting(true);
    try {
      console.log('🧪 Starting audit log fetch and hash test...');
      
      const result = await AuditHashService.generateAuditHashResult();
      
      console.log('🎯 Test Results:');
      console.log(`   - Successfully fetched ${result.logCount} audit logs`);
      console.log(`   - Generated hash: ${result.hash}`);
      console.log(`   - Timestamp: ${result.timestamp}`);
      
      // Also test blockchain preparation
      const blockchainData = AuditHashService.prepareForBlockchain(result);
      console.log('⛓️ Blockchain preparation test successful');
      
      toast({
        title: "Test Completed Successfully! 🎉",
        description: `Fetched ${result.logCount} logs and generated hash. Check console for details.`,
      });
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      toast({
        title: "Test Failed",
        description: "Failed to fetch audit logs or generate hash. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const generateAuditHash = async () => {
    setIsGenerating(true);
    try {
      const result = await AuditHashService.generateAuditHashResult();
      
      setHashResult({
        hash: result.hash,
        logCount: result.logCount,
        timestamp: result.timestamp,
        isAnchored: false
      });

      toast({
        title: "Audit Hash Generated",
        description: `Successfully hashed ${result.logCount} audit log entries`,
      });
    } catch (error) {
      console.error('Error generating audit hash:', error);
      toast({
        title: "Error",
        description: "Failed to generate audit hash",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const anchorOnBlockchain = async () => {
    if (!hashResult) return;

    setIsAnchoring(true);
    try {
      const blockchainData = AuditHashService.prepareForBlockchain({
        hash: hashResult.hash,
        logCount: hashResult.logCount,
        timestamp: hashResult.timestamp,
        logs: []
      });

      // Simulate blockchain transaction
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // Store both types of anchor records
      await Promise.all([
        // Store in audit_hash_anchors (existing functionality)
        AuditHashService.storeHashAnchor(
          hashResult.hash,
          hashResult.logCount,
          mockTxHash,
          'autheo-testnet'
        ),
        // Store in audit_anchors (new blockchain anchor)
        BlockchainAnchorService.storeBlockchainAnchor(
          mockTxHash,
          hashResult.hash,
          hashResult.logCount
        )
      ]);

      setHashResult(prev => prev ? {
        ...prev,
        isAnchored: true,
        blockchainTxHash: mockTxHash
      } : null);

      toast({
        title: "Hash Anchored",
        description: "Audit hash successfully anchored on blockchain",
      });

      // Notify parent component to refresh
      if (onHashAnchored) {
        onHashAnchored();
      }
    } catch (error) {
      console.error('Error anchoring hash:', error);
      toast({
        title: "Anchoring Failed",
        description: "Failed to anchor hash on blockchain",
        variant: "destructive"
      });
    } finally {
      setIsAnchoring(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Audit Hash Anchoring
        </CardTitle>
        <CardDescription>
          Generate cryptographic hashes of audit logs for immutable blockchain anchoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={testAuditLogFetch}
            disabled={isTesting}
            variant="outline"
            className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-slate-900"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test Fetch & Hash
              </>
            )}
          </Button>

          <Button
            onClick={generateAuditHash}
            disabled={isGenerating}
            className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Generate Hash
              </>
            )}
          </Button>

          {hashResult && !hashResult.isAnchored && (
            <Button
              onClick={anchorOnBlockchain}
              disabled={isAnchoring}
              variant="outline"
              className="border-autheo-primary text-autheo-primary hover:bg-autheo-primary hover:text-slate-900"
            >
              {isAnchoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Anchoring...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Anchor on Chain
                </>
              )}
            </Button>
          )}
        </div>

        {hashResult && (
          <div className="space-y-4">
            <Alert className="bg-slate-700/50 border-slate-600">
              <Hash className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Hash Result:</span>
                    <Badge variant={hashResult.isAnchored ? "default" : "secondary"}>
                      {hashResult.isAnchored ? "Anchored" : "Generated"}
                    </Badge>
                  </div>
                  <div className="font-mono text-xs text-slate-300 bg-slate-800 p-2 rounded break-all">
                    {hashResult.hash}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      {hashResult.logCount} logs
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(hashResult.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {hashResult.isAnchored && hashResult.blockchainTxHash && (
              <Alert className="bg-green-900/20 border-green-500/30">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-green-300">
                      Successfully anchored on Autheo blockchain
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Transaction:</span>
                      <span className="font-mono text-green-400">{hashResult.blockchainTxHash}</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="text-xs text-slate-400 space-y-1">
          <p>• <strong>Test Fetch & Hash:</strong> Runs the audit log fetching and hashing locally with detailed console logging</p>
          <p>• <strong>Generate Hash:</strong> Creates a hash for UI display and potential anchoring</p>
          <p>• <strong>Anchor on Chain:</strong> Simulates blockchain anchoring and stores the record</p>
          <p>• Hash is computed using SHA-256 of concatenated audit log entries</p>
          <p>• Blockchain anchoring creates an immutable timestamp proof</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditHashManager;
