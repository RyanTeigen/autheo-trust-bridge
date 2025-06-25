
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Hash, 
  Clock, 
  Database, 
  ExternalLink, 
  Shield, 
  Loader2, 
  TestTube, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Globe
} from 'lucide-react';
import { RealBlockchainAnchorService, RealAnchorResult } from '@/services/audit/RealBlockchainAnchorService';
import { AuditHashService } from '@/services/audit/AuditHashService';
import { useToast } from '@/hooks/use-toast';

interface NetworkStatus {
  connected: boolean;
  networkInfo?: {
    chainId: number;
    networkName: string;
    blockNumber: number;
  };
  balance?: string;
  error?: string;
}

interface RealAnchorRecord extends RealAnchorResult {
  auditHash?: string;
  logCount?: number;
  timestamp?: string;
}

interface RealBlockchainAuditManagerProps {
  onHashAnchored?: () => void;
  useMainnet?: boolean;
}

const RealBlockchainAuditManager: React.FC<RealBlockchainAuditManagerProps> = ({ 
  onHashAnchored, 
  useMainnet = false 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hashResult, setHashResult] = useState<any>(null);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
  const [anchorResult, setAnchorResult] = useState<RealAnchorRecord | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const { toast } = useToast();

  const blockchainService = new RealBlockchainAnchorService(useMainnet);

  const checkNetworkStatus = async () => {
    setIsCheckingNetwork(true);
    try {
      console.log('🌐 Checking blockchain network status...');
      
      const status = await blockchainService.getNetworkStatus();
      setNetworkStatus(status);
      
      if (status.connected) {
        toast({
          title: "Blockchain Connected! 🎉",
          description: `Connected to ${status.networkInfo?.networkName}. Balance: ${status.balance} ETH`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: status.error || "Could not connect to blockchain network",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('❌ Network check failed:', error);
      toast({
        title: "Network Check Failed",
        description: "Failed to check blockchain network status",
        variant: "destructive"
      });
    } finally {
      setIsCheckingNetwork(false);
    }
  };

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
      console.error('❌ Error generating audit hash:', error);
      toast({
        title: "Error",
        description: "Failed to generate audit hash",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const anchorOnRealBlockchain = async () => {
    if (!hashResult) return;

    setIsAnchoring(true);
    try {
      console.log('⛓️ Starting real blockchain anchoring...');
      
      // Generate and anchor in one operation
      const result = await blockchainService.generateAndAnchorAuditHash(100, {
        useMainnet,
        skipDatabaseStorage: false
      });

      if (result.success) {
        setAnchorResult({
          ...result,
          timestamp: new Date().toISOString()
        });

        setHashResult(prev => prev ? {
          ...prev,
          isAnchored: true,
          blockchainTxHash: result.transactionHash
        } : null);

        toast({
          title: "Successfully Anchored on Blockchain! 🎉",
          description: `Transaction: ${result.transactionHash?.substring(0, 12)}...`,
        });

        // Notify parent component to refresh
        if (onHashAnchored) {
          onHashAnchored();
        }
      } else {
        throw new Error(result.error || 'Anchoring failed');
      }

    } catch (error) {
      console.error('❌ Error anchoring on blockchain:', error);
      toast({
        title: "Blockchain Anchoring Failed",
        description: error instanceof Error ? error.message : "Failed to anchor hash on blockchain",
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
          Real Blockchain Audit Anchoring
          <Badge variant="outline" className="text-yellow-400 border-yellow-400 ml-2">
            {useMainnet ? 'MAINNET' : 'TESTNET'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Anchor cryptographic hashes of audit logs on the Autheo blockchain network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Network Status */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={checkNetworkStatus}
            disabled={isCheckingNetwork}
            variant="outline"
            className="border-green-500 text-green-400 hover:bg-green-500 hover:text-slate-900"
          >
            {isCheckingNetwork ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Check Network
              </>
            )}
          </Button>

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
                Test Hash Generation
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
              onClick={anchorOnRealBlockchain}
              disabled={isAnchoring || !networkStatus?.connected}
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
                  <Zap className="h-4 w-4 mr-2" />
                  Anchor on Blockchain
                </>
              )}
            </Button>
          )}
        </div>

        {/* Network Status Display */}
        {networkStatus && (
          <Alert className={`${networkStatus.connected ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
            {networkStatus.connected ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  {networkStatus.connected ? 'Blockchain Connected' : 'Connection Failed'}
                </div>
                {networkStatus.connected && networkStatus.networkInfo && (
                  <div className="text-xs space-y-1">
                    <div>Network: {networkStatus.networkInfo.networkName}</div>
                    <div>Chain ID: {networkStatus.networkInfo.chainId}</div>
                    <div>Latest Block: {networkStatus.networkInfo.blockNumber.toLocaleString()}</div>
                    <div>Balance: {networkStatus.balance} ETH</div>
                  </div>
                )}
                {!networkStatus.connected && networkStatus.error && (
                  <div className="text-xs text-red-400">{networkStatus.error}</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Hash Result Display */}
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
          </div>
        )}

        {/* Anchor Result Display */}
        {anchorResult && anchorResult.success && (
          <Alert className="bg-green-900/20 border-green-500/30">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="text-sm font-medium text-green-300">
                  Successfully anchored on {useMainnet ? 'Autheo Mainnet' : 'Autheo Testnet'}!
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Transaction:</span>
                    <span className="font-mono text-green-400">{anchorResult.transactionHash}</span>
                    {anchorResult.explorerUrl && (
                      <a 
                        href={anchorResult.explorerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-autheo-primary hover:text-autheo-primary/80"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  {anchorResult.blockNumber && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Block:</span>
                      <span className="text-green-400">{anchorResult.blockNumber.toLocaleString()}</span>
                    </div>
                  )}
                  {anchorResult.gasUsed && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Gas Used:</span>
                      <span className="text-green-400">{anchorResult.gasUsed.toLocaleString()}</span>
                    </div>
                  )}
                  {anchorResult.logCount && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Logs Anchored:</span>
                      <span className="text-green-400">{anchorResult.logCount} entries</span>
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-slate-400 space-y-1">
          <p>• <strong>Check Network:</strong> Verifies connection to the Autheo blockchain</p>
          <p>• <strong>Test Hash Generation:</strong> Tests audit log fetching and hashing locally</p>
          <p>• <strong>Generate Hash:</strong> Creates a hash for blockchain anchoring</p>
          <p>• <strong>Anchor on Blockchain:</strong> Stores the hash immutably on Autheo blockchain</p>
          <p>• Network: {useMainnet ? 'Autheo Mainnet (LIVE)' : 'Autheo Testnet (Testing)'}</p>
          <p>• Hash is computed using SHA-256 of concatenated audit log entries</p>
          <p>• Blockchain anchoring provides cryptographic proof of data integrity</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealBlockchainAuditManager;
