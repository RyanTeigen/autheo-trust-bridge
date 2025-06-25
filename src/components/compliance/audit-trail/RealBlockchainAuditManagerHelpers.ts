
import { RealBlockchainAnchorService } from '@/services/audit/RealBlockchainAnchorService';
import { AuditHashService } from '@/services/audit/AuditHashService';

export const checkNetworkStatus = async (
  blockchainService: RealBlockchainAnchorService,
  setIsCheckingNetwork: (loading: boolean) => void,
  setNetworkStatus: (status: any) => void,
  toast: any
) => {
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

export const testAuditLogFetch = async (
  setIsTesting: (loading: boolean) => void,
  toast: any
) => {
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

export const generateAuditHash = async (
  setIsGenerating: (loading: boolean) => void,
  setHashResult: (result: any) => void,
  toast: any
) => {
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

export const anchorOnRealBlockchain = async (
  hashResult: any,
  blockchainService: RealBlockchainAnchorService,
  useMainnet: boolean,
  setIsAnchoring: (loading: boolean) => void,
  setAnchorResult: (result: any) => void,
  setHashResult: (result: any) => void,
  onHashAnchored: (() => void) | undefined,
  toast: any
) => {
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
