
import Web3 from 'web3';
import { SUPABASE_URL } from '@/utils/environment';

export interface BlockchainTransaction {
  hash: string;
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

class AutheoBlockchainService {
  private web3: Web3;
  private contractAddress: string;
  private defaultAccount: string | null = null;

  // Autheo Testnet configuration
  private readonly AUTHEO_TESTNET_RPC = 'https://rpc-testnet.autheo.io';
  private readonly AUTHEO_MAINNET_RPC = 'https://rpc.autheo.io';
  
  // Smart contract ABI for audit anchoring
  private readonly AUDIT_ANCHOR_ABI = [
    {
      "inputs": [
        {"internalType": "string", "name": "auditHash", "type": "string"},
        {"internalType": "uint256", "name": "logCount", "type": "uint256"},
        {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
      ],
      "name": "anchorAuditHash",
      "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "bytes32", "name": "anchorId", "type": "bytes32"}],
      "name": "getAnchor",
      "outputs": [
        {"internalType": "string", "name": "auditHash", "type": "string"},
        {"internalType": "uint256", "name": "logCount", "type": "uint256"},
        {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
        {"internalType": "address", "name": "anchorer", "type": "address"}
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  constructor(useMainnet: boolean = false) {
    const rpcUrl = useMainnet ? this.AUTHEO_MAINNET_RPC : this.AUTHEO_TESTNET_RPC;
    this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    
    // Contract address for audit anchoring (would be deployed separately)
    this.contractAddress = useMainnet 
      ? '0x742d35Cc8Ba6458b4b9395Fa3a44b4b8D4E6F8Cf' // Mainnet contract
      : '0x123d35Cc8Ba6458b4b9395Fa3a44b4b8D4E6F8Cf'; // Testnet contract
  }

  /**
   * Initialize the service with a private key or connect to MetaMask
   */
  async initialize(privateKey?: string): Promise<boolean> {
    try {
      if (privateKey) {
        // Use provided private key for server-side operations
        const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        this.web3.eth.accounts.wallet.add(account);
        this.defaultAccount = account.address;
        this.web3.eth.defaultAccount = account.address;
      } else if (typeof window !== 'undefined' && (window as any).ethereum) {
        // Use MetaMask for client-side operations
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await this.web3.eth.getAccounts();
        this.defaultAccount = accounts[0];
        this.web3.eth.defaultAccount = accounts[0];
      } else {
        console.warn('No private key provided and MetaMask not available');
        return false;
      }

      console.log('✅ Blockchain service initialized with account:', this.defaultAccount);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error);
      return false;
    }
  }

  /**
   * Anchor an audit hash on the Autheo blockchain
   */
  async anchorAuditHash(
    auditHash: string,
    logCount: number,
    timestamp?: number
  ): Promise<AnchorResult> {
    if (!this.defaultAccount) {
      return {
        success: false,
        error: 'Blockchain service not initialized'
      };
    }

    try {
      console.log('⛓️ Anchoring audit hash on Autheo blockchain...');
      console.log(`   - Hash: ${auditHash}`);
      console.log(`   - Log Count: ${logCount}`);
      console.log(`   - Account: ${this.defaultAccount}`);

      const contract = new this.web3.eth.Contract(this.AUDIT_ANCHOR_ABI, this.contractAddress);
      const anchorTimestamp = timestamp || Math.floor(Date.now() / 1000);

      // Estimate gas - convert bigint to number
      const gasEstimateBigInt = await contract.methods
        .anchorAuditHash(auditHash, logCount, anchorTimestamp)
        .estimateGas({ from: this.defaultAccount });
      
      const gasEstimate = Number(gasEstimateBigInt);
      console.log(`⛽ Estimated gas: ${gasEstimate}`);

      // Get gas price - convert bigint to string for Web3 operations
      const gasPriceBigInt = await this.web3.eth.getGasPrice();
      const gasPrice = gasPriceBigInt.toString();

      // Send transaction - convert gas to string
      const transaction = await contract.methods
        .anchorAuditHash(auditHash, logCount, anchorTimestamp)
        .send({
          from: this.defaultAccount,
          gas: Math.floor(gasEstimate * 1.2).toString(), // Convert to string for Web3
          gasPrice: gasPrice
        });

      console.log('✅ Transaction successful:', transaction.transactionHash);

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
  async verifyAnchor(transactionHash: string): Promise<BlockchainTransaction | null> {
    try {
      const receipt = await this.web3.eth.getTransactionReceipt(transactionHash);
      if (!receipt) {
        return null;
      }

      const block = await this.web3.eth.getBlock(receipt.blockNumber);

      return {
        hash: receipt.transactionHash,
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
   * Get current network information
   */
  async getNetworkInfo(): Promise<{
    chainId: number;
    networkName: string;
    blockNumber: number;
  }> {
    const chainIdBigInt = await this.web3.eth.getChainId();
    const blockNumberBigInt = await this.web3.eth.getBlockNumber();
    
    const chainId = Number(chainIdBigInt);
    const blockNumber = Number(blockNumberBigInt);
    
    const networkName = chainId === 1 
      ? 'Autheo Mainnet' 
      : chainId === 3 
        ? 'Autheo Testnet' 
        : `Unknown Network (${chainId})`;

    return {
      chainId,
      networkName,
      blockNumber
    };
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<string> {
    if (!this.defaultAccount) {
      return '0';
    }

    const balanceWei = await this.web3.eth.getBalance(this.defaultAccount);
    return this.web3.utils.fromWei(balanceWei, 'ether');
  }

  /**
   * Create a data payload for blockchain anchoring
   */
  static createDataPayload(auditHash: string): string {
    // Convert hash to bytes for blockchain storage
    return Web3.utils.keccak256(auditHash);
  }

  /**
   * Generate a blockchain explorer URL for a transaction
   */
  getExplorerUrl(transactionHash: string, useMainnet: boolean = false): string {
    const baseUrl = useMainnet 
      ? 'https://explorer.autheo.io'
      : 'https://testnet-explorer.autheo.io';
    
    return `${baseUrl}/tx/${transactionHash}`;
  }
}

export default AutheoBlockchainService;
