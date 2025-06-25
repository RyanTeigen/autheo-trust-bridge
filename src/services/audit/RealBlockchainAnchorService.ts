
import { supabase } from '@/integrations/supabase/client';
import AutheoBlockchainService, { AnchorResult } from '@/services/blockchain/AutheoBlockchainService';
import { AuditHashService } from './AuditHashService';

export interface RealAnchorResult {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  explorerUrl?: string;
  error?: string;
}

export class RealBlockchainAnchorService {
  private blockchainService: AutheoBlockchainService;
  private useMainnet: boolean;

  constructor(useMainnet: boolean = false) {
    this.useMainnet = useMainnet;
    this.blockchainService = new AutheoBlockchainService(useMainnet);
  }

  /**
   * Initialize the blockchain service
   */
  async initialize(privateKey?: string): Promise<boolean> {
    return await this.blockchainService.initialize(privateKey);
  }

  /**
   * Anchor audit logs on the real Autheo blockchain
   */
  async anchorAuditHashOnBlockchain(
    auditHash: string,
    logCount: number,
    options?: {
      skipDatabaseStorage?: boolean;
      customTimestamp?: number;
    }
  ): Promise<RealAnchorResult> {
    console.log('🚀 Starting real blockchain anchoring process...');
    
    try {
      // Initialize blockchain service if not already done
      const initialized = await this.initialize();
      if (!initialized) {
        return {
          success: false,
          error: 'Failed to initialize blockchain connection'
        };
      }

      // Get network info for verification
      const networkInfo = await this.blockchainService.getNetworkInfo();
      console.log('🌐 Network Info:', networkInfo);

      // Check account balance
      const balance = await this.blockchainService.getBalance();
      console.log(`💰 Account Balance: ${balance} ETH`);

      if (parseFloat(balance) < 0.001) {
        return {
          success: false,
          error: 'Insufficient balance for blockchain transaction'
        };
      }

      // Anchor the hash on blockchain
      const anchorResult: AnchorResult = await this.blockchainService.anchorAuditHash(
        auditHash,
        logCount,
        options?.customTimestamp
      );

      if (!anchorResult.success) {
        return {
          success: false,
          error: anchorResult.error || 'Blockchain anchoring failed'
        };
      }

      console.log('✅ Blockchain anchoring successful!');
      console.log(`   - Transaction Hash: ${anchorResult.transactionHash}`);
      console.log(`   - Block Number: ${anchorResult.blockNumber}`);
      console.log(`   - Gas Used: ${anchorResult.gasUsed}`);

      // Store in database unless skipped
      if (!options?.skipDatabaseStorage && anchorResult.transactionHash) {
        await this.storeBlockchainAnchor(
          anchorResult.transactionHash,
          auditHash,
          logCount,
          anchorResult.blockNumber
        );
      }

      const explorerUrl = this.blockchainService.getExplorerUrl(
        anchorResult.transactionHash!,
        this.useMainnet
      );

      return {
        success: true,
        transactionHash: anchorResult.transactionHash,
        blockNumber: anchorResult.blockNumber,
        gasUsed: anchorResult.gasUsed,
        explorerUrl
      };

    } catch (error) {
      console.error('❌ Real blockchain anchoring failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown anchoring error'
      };
    }
  }

  /**
   * Generate and anchor audit hash in one operation
   */
  async generateAndAnchorAuditHash(
    logLimit: number = 100,
    options?: {
      useMainnet?: boolean;
      skipDatabaseStorage?: boolean;
    }
  ): Promise<RealAnchorResult & { auditHash?: string; logCount?: number }> {
    try {
      console.log('📊 Generating audit hash from recent logs...');
      
      // Generate audit hash result
      const hashResult = await AuditHashService.generateAuditHashResult(logLimit);
      
      console.log(`✅ Generated hash: ${hashResult.hash}`);
      console.log(`📝 Processed ${hashResult.logCount} logs`);

      // Anchor on blockchain
      const anchorResult = await this.anchorAuditHashOnBlockchain(
        hashResult.hash,
        hashResult.logCount,
        options
      );

      return {
        ...anchorResult,
        auditHash: hashResult.hash,
        logCount: hashResult.logCount
      };

    } catch (error) {
      console.error('❌ Generate and anchor process failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Generate and anchor failed'
      };
    }
  }

  /**
   * Verify a blockchain anchor exists and is valid
   */
  async verifyBlockchainAnchor(transactionHash: string): Promise<{
    verified: boolean;
    transaction?: any;
    error?: string;
  }> {
    try {
      const transaction = await this.blockchainService.verifyAnchor(transactionHash);
      
      if (!transaction) {
        return {
          verified: false,
          error: 'Transaction not found on blockchain'
        };
      }

      return {
        verified: transaction.status,
        transaction
      };

    } catch (error) {
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Store blockchain anchor in database
   */
  private async storeBlockchainAnchor(
    txHash: string,
    auditHash: string,
    logCount: number,
    blockNumber?: number
  ): Promise<void> {
    console.log('💾 Storing blockchain anchor in database...');

    const networkName = this.useMainnet ? 'autheo-mainnet' : 'autheo-testnet';

    // Store in audit_hash_anchors table
    const { error: hashError } = await supabase
      .from('audit_hash_anchors')
      .insert({
        hash: auditHash,
        log_count: logCount,
        blockchain_tx_hash: txHash,
        blockchain_network: networkName,
        created_at: new Date().toISOString()
      });

    if (hashError) {
      console.error('❌ Error storing hash anchor:', hashError);
      throw new Error(`Failed to store hash anchor: ${hashError.message}`);
    }

    // Store in audit_anchors table
    const { error: anchorError } = await supabase
      .from('audit_anchors')
      .insert({
        tx_hash: txHash,
        audit_hash: auditHash,
        log_count: logCount,
        anchored_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (anchorError) {
      console.error('❌ Error storing blockchain anchor:', anchorError);
      throw new Error(`Failed to store blockchain anchor: ${anchorError.message}`);
    }

    console.log('✅ Blockchain anchor stored successfully in database');
  }

  /**
   * Get blockchain network status
   */
  async getNetworkStatus(): Promise<{
    connected: boolean;
    networkInfo?: any;
    balance?: string;
    error?: string;
  }> {
    try {
      const initialized = await this.initialize();
      if (!initialized) {
        return {
          connected: false,
          error: 'Could not connect to blockchain'
        };
      }

      const networkInfo = await this.blockchainService.getNetworkInfo();
      const balance = await this.blockchainService.getBalance();

      return {
        connected: true,
        networkInfo,
        balance
      };

    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Network check failed'
      };
    }
  }
}
