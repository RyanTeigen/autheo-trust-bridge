
import Web3 from 'web3';
import { BlockchainConnection } from '../connection/BlockchainConnection';
import { AUDIT_ANCHOR_ABI } from '../abi/ContractABI';

export interface TransactionResult {
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  status: boolean;
  timestamp: number;
}

export interface AnchorResult {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  error?: string;
}

export interface TransactionVerification {
  exists: boolean;
  confirmed: boolean;
  blockNumber?: number;
  gasUsed?: number;
  status?: boolean;
  timestamp?: number;
  confirmations?: number;
  logs?: any[];
  explorerUrl?: string;
}

export class ContractInteraction {
  private connection: BlockchainConnection;
  private web3: Web3;

  constructor(connection: BlockchainConnection) {
    this.connection = connection;
    this.web3 = connection.getWeb3();
  }

  /**
   * Anchor an audit hash on the blockchain
   */
  async anchorAuditHash(
    auditHash: string,
    logCount: number,
    timestamp?: number
  ): Promise<AnchorResult> {
    const defaultAccount = this.connection.getDefaultAccount();
    const networkConfig = this.connection.getNetworkConfig();

    if (!defaultAccount) {
      return {
        success: false,
        error: 'No account connected'
      };
    }

    try {
      console.log('⛓️ Anchoring audit hash on blockchain...');
      console.log(`   - Hash: ${auditHash}`);
      console.log(`   - Log Count: ${logCount}`);
      console.log(`   - Account: ${defaultAccount}`);

      const contract = new this.web3.eth.Contract(AUDIT_ANCHOR_ABI, networkConfig.contractAddress);
      const anchorTimestamp = timestamp || Math.floor(Date.now() / 1000);

      // Estimate gas
      const gasEstimateBigInt = await contract.methods
        .anchorAuditHash(auditHash, logCount, anchorTimestamp)
        .estimateGas({ from: defaultAccount });
      
      const gasEstimate = Number(gasEstimateBigInt);
      console.log(`⛽ Estimated gas: ${gasEstimate}`);

      // Get gas price
      const gasPriceBigInt = await this.web3.eth.getGasPrice();
      const gasPrice = gasPriceBigInt.toString();

      // Send transaction
      const transaction = await contract.methods
        .anchorAuditHash(auditHash, logCount, anchorTimestamp)
        .send({
          from: defaultAccount,
          gas: Math.floor(gasEstimate * 1.2).toString(),
          gasPrice: gasPrice
        });

      console.log('✅ Transaction successful:', transaction.transactionHash);
      console.log(`📊 Block Number: ${transaction.blockNumber}`);
      console.log(`⛽ Gas Used: ${transaction.gasUsed}`);

      return {
        success: true,
        transactionHash: transaction.transactionHash,
        blockNumber: Number(transaction.blockNumber),
        gasUsed: Number(transaction.gasUsed)
      };

    } catch (error) {
      console.error('❌ Failed to anchor audit hash:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown blockchain error'
      };
    }
  }

  /**
   * Verify an anchored audit hash exists on the blockchain
   */
  async verifyAnchor(transactionHash: string): Promise<TransactionResult | null> {
    try {
      const receipt = await this.web3.eth.getTransactionReceipt(transactionHash);
      if (!receipt) {
        return null;
      }

      const block = await this.web3.eth.getBlock(receipt.blockNumber);

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: Number(receipt.gasUsed),
        status: Boolean(receipt.status),
        timestamp: typeof block.timestamp === 'string' 
          ? parseInt(block.timestamp) 
          : Number(block.timestamp)
      };
    } catch (error) {
      console.error('❌ Failed to verify anchor:', error);
      return null;
    }
  }

  /**
   * Comprehensive transaction verification with explorer integration
   */
  async verifyTransactionWithDetails(transactionHash: string): Promise<TransactionVerification> {
    try {
      console.log(`🔍 Verifying transaction: ${transactionHash}`);
      
      // Get transaction receipt
      const receipt = await this.web3.eth.getTransactionReceipt(transactionHash);
      if (!receipt) {
        console.log('❌ Transaction not found');
        return {
          exists: false,
          confirmed: false
        };
      }

      // Get current block number for confirmations
      const currentBlockNumber = await this.web3.eth.getBlockNumber();
      const confirmations = Number(currentBlockNumber) - Number(receipt.blockNumber);

      // Get block details
      const block = await this.web3.eth.getBlock(receipt.blockNumber);
      
      // Get transaction details
      const transaction = await this.web3.eth.getTransaction(transactionHash);

      const networkConfig = this.connection.getNetworkConfig();
      const useMainnet = networkConfig.chainId === 1;
      const explorerUrl = `${networkConfig.explorerUrl}/tx/${transactionHash}`;

      const result: TransactionVerification = {
        exists: true,
        confirmed: Boolean(receipt.status),
        blockNumber: Number(receipt.blockNumber),
        gasUsed: Number(receipt.gasUsed),
        status: Boolean(receipt.status),
        timestamp: typeof block.timestamp === 'string' 
          ? parseInt(block.timestamp) 
          : Number(block.timestamp),
        confirmations,
        logs: receipt.logs,
        explorerUrl
      };

      console.log('✅ Transaction verification complete:');
      console.log(`   - Block Number: ${result.blockNumber}`);
      console.log(`   - Status: ${result.status ? 'Success' : 'Failed'}`);
      console.log(`   - Confirmations: ${result.confirmations}`);
      console.log(`   - Gas Used: ${result.gasUsed}`);
      console.log(`   - Explorer URL: ${result.explorerUrl}`);

      return result;

    } catch (error) {
      console.error('❌ Transaction verification failed:', error);
      return {
        exists: false,
        confirmed: false,
        explorerUrl: `${this.connection.getNetworkConfig().explorerUrl}/tx/${transactionHash}`
      };
    }
  }

  /**
   * Create a data payload for blockchain anchoring
   */
  static createDataPayload(auditHash: string): string {
    return Web3.utils.keccak256(auditHash);
  }
}
