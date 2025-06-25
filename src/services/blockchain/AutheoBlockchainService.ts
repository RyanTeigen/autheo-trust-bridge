
import { BlockchainConnection } from './connection/BlockchainConnection';
import { ContractInteraction, AnchorResult } from './contracts/ContractInteraction';
import { BlockchainUtils } from './utils/BlockchainUtils';

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  gasUsed: number;
  status: boolean;
  timestamp: number;
}

export type { AnchorResult };

class AutheoBlockchainService {
  private connection: BlockchainConnection;
  private contractInteraction: ContractInteraction;
  private useMainnet: boolean;

  constructor(useMainnet: boolean = false) {
    this.useMainnet = useMainnet;
    this.connection = new BlockchainConnection(useMainnet);
    this.contractInteraction = new ContractInteraction(this.connection);
  }

  /**
   * Initialize the service with a private key or connect to MetaMask
   */
  async initialize(privateKey?: string): Promise<boolean> {
    return await this.connection.initialize(privateKey);
  }

  /**
   * Anchor an audit hash on the Autheo blockchain
   */
  async anchorAuditHash(
    auditHash: string,
    logCount: number,
    timestamp?: number
  ): Promise<AnchorResult> {
    return await this.contractInteraction.anchorAuditHash(auditHash, logCount, timestamp);
  }

  /**
   * Verify an anchored audit hash exists on the blockchain
   */
  async verifyAnchor(transactionHash: string): Promise<BlockchainTransaction | null> {
    const result = await this.contractInteraction.verifyAnchor(transactionHash);
    return result ? {
      hash: result.transactionHash,
      blockNumber: result.blockNumber,
      gasUsed: result.gasUsed,
      status: result.status,
      timestamp: result.timestamp
    } : null;
  }

  /**
   * Get current network information
   */
  async getNetworkInfo(): Promise<{
    chainId: number;
    networkName: string;
    blockNumber: number;
  }> {
    return await this.connection.getNetworkInfo();
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<string> {
    return await this.connection.getBalance();
  }

  /**
   * Create a data payload for blockchain anchoring
   */
  static createDataPayload(auditHash: string): string {
    return BlockchainUtils.createDataPayload(auditHash);
  }

  /**
   * Generate a blockchain explorer URL for a transaction
   */
  getExplorerUrl(transactionHash: string, useMainnet?: boolean): string {
    return BlockchainUtils.getExplorerUrl(transactionHash, useMainnet ?? this.useMainnet);
  }

  /**
   * Get connection status
   */
  async getConnectionStatus() {
    return await this.connection.getConnectionStatus();
  }
}

export default AutheoBlockchainService;
