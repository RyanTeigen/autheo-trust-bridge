
import Web3 from 'web3';
import { BlockchainConfig, NetworkConfig } from '../config/BlockchainConfig';

export interface ConnectionStatus {
  isConnected: boolean;
  account: string | null;
  balance: string;
  networkInfo: {
    chainId: number;
    networkName: string;
    blockNumber: number;
  };
}

export class BlockchainConnection {
  private web3: Web3;
  private networkConfig: NetworkConfig;
  private defaultAccount: string | null = null;

  constructor(useMainnet: boolean = false) {
    this.networkConfig = BlockchainConfig.getNetworkConfig(useMainnet);
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.networkConfig.rpcUrl));
  }

  /**
   * Initialize the connection with a private key or MetaMask
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

      console.log('✅ Blockchain connection initialized with account:', this.defaultAccount);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain connection:', error);
      return false;
    }
  }

  /**
   * Get current connection status
   */
  async getConnectionStatus(): Promise<ConnectionStatus> {
    const balance = await this.getBalance();
    const networkInfo = await this.getNetworkInfo();
    
    return {
      isConnected: this.defaultAccount !== null,
      account: this.defaultAccount,
      balance,
      networkInfo
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
   * Get Web3 instance
   */
  getWeb3(): Web3 {
    return this.web3;
  }

  /**
   * Get default account
   */
  getDefaultAccount(): string | null {
    return this.defaultAccount;
  }

  /**
   * Get network configuration
   */
  getNetworkConfig(): NetworkConfig {
    return this.networkConfig;
  }
}
