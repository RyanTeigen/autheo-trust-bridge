
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Globe,
  Search,
  Eye
} from 'lucide-react';
import { RealBlockchainAnchorService, RealAnchorResult } from '@/services/audit/RealBlockchainAnchorService';
import { useToast } from '@/hooks/use-toast';
import { 
  checkNetworkStatus,
  testAuditLogFetch,
  generateAuditHash,
  anchorOnRealBlockchain
} from './RealBlockchainAuditManagerHelpers';

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

interface TransactionVerification {
  exists: boolean;
  confirmed: boolean;
  blockNumber?: number;
  gasUsed?: number;
  status?: boolean;
  timestamp?: number;
  confirmations?: number;
  explorerUrl?: string;
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [anchorResult, setAnchorResult] = useState<RealAnchorRecord | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [verificationTxHash, setVerificationTxHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<TransactionVerification | null>(null);
  const { toast } = useToast();

  const blockchainService = new RealBlockchainAnchorService(useMainnet);

  const handleCheckNetworkStatus = () => {
    checkNetworkStatus(blockchainService, setIsCheckingNetwork, setNetworkStatus, toast);
  };

  const handleTestAuditLogFetch = () => {
    testAuditLogFetch(setIsTesting, toast);
  };

  const handleGenerateAuditHash = () => {
    generateAuditHash(setIsGenerating, setHashResult, toast);
  };

  const handleAnchorOnRealBlockchain = () => {
    anchorOnRealBlockchain(
      hashResult,
      blockchainService,
      useMainnet,
      setIsAnchoring,
      setAnchorResult,
      setHashResult,
      onHashAnchored,
      toast
    );
  };

  const verifyTransaction = async () => {
    if (!verificationTxHash.trim()) {
      toast({
        title: "Missing Transaction Hash",
        description: "Please enter a transaction hash to verify",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      console.log(`🔍 Verifying transaction: ${verificationTxHash}`);
      
      const verification = await blockchainService.verifyBlockchainAnchor(verificationTxHash);
      
      if (verification.verified && verification.transaction) {
        const explorerUrl = `${useMainnet ? 'https://explorer.autheo.io' : 'https://testnet-explorer.autheo.io'}/tx/${verificationTxHash}`;
        
        setVerificationResult({
          exists: true,
          confirmed: verification.transaction.status,
          blockNumber: verification.transaction.blockNumber,
          gasUsed: verification.transaction.gasUsed,
          status: verification.transaction.status,
          timestamp: verification.transaction.timestamp,
          confirmations: 0, // Would need current block to calculate
          explorerUrl
        });

        toast({
          title: "Transaction Verified! ✅",
          description: `Transaction found in block ${verification.transaction.blockNumber}`,
        });
      } else {
        const explorerUrl = `${useMainnet ? 'https://explorer.autheo.io' : 'https://testnet-explorer.autheo.io'}/tx/${verificationTxHash}`;
        
        setVerificationResult({
          exists: false,
          confirmed: false,
          explorerUrl
        });

        toast({
          title: "Transaction Not Found",
          description: verification.error || "Transaction could not be verified on the blockchain",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('❌ Transaction verification failed:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify transaction on blockchain",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
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
          Anchor cryptographic hashes of audit logs on the Autheo blockchain network and verify transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Network Status */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleCheckNetworkStatus}
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
            onClick={handleTestAuditLogFetch}
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
            onClick={handleGenerateAuditHash}
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
              onClick={handleAnchorOnRealBlockchain}
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

        {/* Transaction Verification Section */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-200 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Transaction Verification
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Verify any transaction hash on the Autheo blockchain explorer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tx-hash" className="text-xs text-slate-300">
                Transaction Hash
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tx-hash"
                  value={verificationTxHash}
                  onChange={(e) => setVerificationTxHash(e.target.value)}
                  placeholder="0x..."
                  className="bg-slate-800 border-slate-600 text-slate-200 font-mono text-xs"
                />
                <Button
                  onClick={verifyTransaction}
                  disabled={isVerifying || !verificationTxHash.trim()}
                  size="sm"
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-slate-900"
                >
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Auto-fill from anchor result */}
            {anchorResult?.transactionHash && (
              <Button
                onClick={() => setVerificationTxHash(anchorResult.transactionHash!)}
                size="sm"
                variant="ghost"
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Use last anchored tx: {anchorResult.transactionHash.substring(0, 12)}...
              </Button>
            )}
          </CardContent>
        </Card>

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

        {/* Verification Result Display */}
        {verificationResult && (
          <Alert className={`${verificationResult.exists && verificationResult.confirmed ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
            {verificationResult.exists && verificationResult.confirmed ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {verificationResult.exists ? 
                    (verificationResult.confirmed ? 'Transaction Verified ✅' : 'Transaction Failed ❌') : 
                    'Transaction Not Found ❌'
                  }
                </div>
                {verificationResult.exists && (
                  <div className="text-xs space-y-1">
                    {verificationResult.blockNumber && (
                      <div>Block Number: {verificationResult.blockNumber.toLocaleString()}</div>
                    )}
                    {verificationResult.gasUsed && (
                      <div>Gas Used: {verificationResult.gasUsed.toLocaleString()}</div>
                    )}
                    {verificationResult.timestamp && (
                      <div>Timestamp: {new Date(verificationResult.timestamp * 1000).toLocaleString()}</div>
                    )}
                    {verificationResult.confirmations !== undefined && (
                      <div>Confirmations: {verificationResult.confirmations}</div>
                    )}
                  </div>
                )}
                {verificationResult.explorerUrl && (
                  <div className="pt-2">
                    <a 
                      href={verificationResult.explorerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                    >
                      View on Autheo Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
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
          <p>• <strong>Transaction Verification:</strong> Verify any transaction hash on the Autheo explorer</p>
          <p>• Network: {useMainnet ? 'Autheo Mainnet (LIVE)' : 'Autheo Testnet (Testing)'}</p>
          <p>• Hash is computed using SHA-256 of concatenated audit log entries</p>
          <p>• Blockchain anchoring provides cryptographic proof of data integrity</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealBlockchainAuditManager;
