
import { supabase } from '@/integrations/supabase/client';

export interface BlockchainNetwork {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  theoTokenAddress: string;
  bridgeContractAddress: string;
  isMainnet: boolean;
  gasPrice?: string;
  blockTime: number; // in seconds
}

export interface CrossChainTransaction {
  id: string;
  fromNetwork: string;
  toNetwork: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  theoAmount: string;
  status: 'pending' | 'bridging' | 'completed' | 'failed';
  txHash?: string;
  bridgeTxHash?: string;
  timestamp: string;
  estimatedTime: number; // in minutes
}

export interface BridgeQuote {
  fromAmount: string;
  toAmount: string;
  theoRequired: string;
  bridgeFee: string;
  networkFee: string;
  totalFee: string;
  estimatedTime: number;
  route: string[];
}

class CrossChainService {
  private static instance: CrossChainService;
  private supportedNetworks: BlockchainNetwork[] = [];

  public static getInstance(): CrossChainService {
    if (!CrossChainService.instance) {
      CrossChainService.instance = new CrossChainService();
    }
    return CrossChainService.instance;
  }

  constructor() {
    this.initializeSupportedNetworks();
  }

  private initializeSupportedNetworks(): void {
    this.supportedNetworks = [
      {
        id: 'autheo-mainnet',
        name: 'Autheo Mainnet',
        chainId: 2024,
        rpcUrl: 'https://rpc.autheo.network',
        explorerUrl: 'https://explorer.autheo.network',
        nativeCurrency: {
          name: 'THEO',
          symbol: 'THEO',
          decimals: 18
        },
        theoTokenAddress: '0x0000000000000000000000000000000000000000', // Native token
        bridgeContractAddress: '0x1234567890123456789012345678901234567890',
        isMainnet: true,
        blockTime: 3
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        chainId: 1,
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
        explorerUrl: 'https://etherscan.io',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18
        },
        theoTokenAddress: '0xAbCdEf1234567890123456789012345678901234',
        bridgeContractAddress: '0x2345678901234567890123456789012345678901',
        isMainnet: false,
        blockTime: 12
      },
      {
        id: 'polygon',
        name: 'Polygon',
        chainId: 137,
        rpcUrl: 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        theoTokenAddress: '0xBcDeFa1234567890123456789012345678901234',
        bridgeContractAddress: '0x3456789012345678901234567890123456789012',
        isMainnet: false,
        blockTime: 2
      },
      {
        id: 'bsc',
        name: 'BNB Chain',
        chainId: 56,
        rpcUrl: 'https://bsc-dataseed.binance.org',
        explorerUrl: 'https://bscscan.com',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        theoTokenAddress: '0xCdEfAb1234567890123456789012345678901234',
        bridgeContractAddress: '0x4567890123456789012345678901234567890123',
        isMainnet: false,
        blockTime: 3
      }
    ];
  }

  async getSupportedNetworks(): Promise<BlockchainNetwork[]> {
    return this.supportedNetworks;
  }

  async getNetworkById(networkId: string): Promise<BlockchainNetwork | null> {
    return this.supportedNetworks.find(network => network.id === networkId) || null;
  }

  async getMainnetNetwork(): Promise<BlockchainNetwork> {
    const mainnet = this.supportedNetworks.find(network => network.isMainnet);
    if (!mainnet) {
      throw new Error('Autheo mainnet not configured');
    }
    return mainnet;
  }

  async getBridgeQuote(
    fromNetworkId: string,
    toNetworkId: string,
    amount: string,
    tokenAddress?: string
  ): Promise<BridgeQuote> {
    const fromNetwork = await this.getNetworkById(fromNetworkId);
    const toNetwork = await this.getNetworkById(toNetworkId);
    
    if (!fromNetwork || !toNetwork) {
      throw new Error('Invalid network selection');
    }

    // Calculate bridge fees and THEO requirements
    const amountNum = parseFloat(amount);
    const bridgeFee = (amountNum * 0.003).toString(); // 0.3% bridge fee
    const networkFee = '0.001'; // Estimated network fee
    const theoRequired = (amountNum * 1.1).toString(); // 10% THEO collateral requirement
    
    // Calculate route through THEO token
    const route = fromNetwork.isMainnet ? 
      [fromNetworkId, toNetworkId] : 
      [fromNetworkId, 'autheo-mainnet', toNetworkId];

    const estimatedTime = this.calculateBridgeTime(fromNetwork, toNetwork);
    const toAmount = (amountNum - parseFloat(bridgeFee)).toString();
    const totalFee = (parseFloat(bridgeFee) + parseFloat(networkFee)).toString();

    return {
      fromAmount: amount,
      toAmount,
      theoRequired,
      bridgeFee,
      networkFee,
      totalFee,
      estimatedTime,
      route
    };
  }

  private calculateBridgeTime(fromNetwork: BlockchainNetwork, toNetwork: BlockchainNetwork): number {
    // Base time for cross-chain operations
    let baseTime = 5; // 5 minutes base
    
    // Add confirmation times based on block times
    const fromConfirmations = Math.max(12, Math.ceil(60 / fromNetwork.blockTime)); // At least 1 minute
    const toConfirmations = Math.max(12, Math.ceil(60 / toNetwork.blockTime));
    
    const confirmationTime = ((fromConfirmations * fromNetwork.blockTime) + 
                             (toConfirmations * toNetwork.blockTime)) / 60;
    
    // Add extra time for non-mainnet networks
    if (!fromNetwork.isMainnet || !toNetwork.isMainnet) {
      baseTime += 10;
    }
    
    return Math.ceil(baseTime + confirmationTime);
  }

  async initiateBridge(
    fromNetworkId: string,
    toNetworkId: string,
    amount: string,
    fromAddress: string,
    toAddress: string,
    userSignature: string
  ): Promise<CrossChainTransaction> {
    try {
      const quote = await this.getBridgeQuote(fromNetworkId, toNetworkId, amount);
      
      // Create transaction record
      const transaction: CrossChainTransaction = {
        id: crypto.randomUUID(),
        fromNetwork: fromNetworkId,
        toNetwork: toNetworkId,
        fromAddress,
        toAddress,
        amount,
        theoAmount: quote.theoRequired,
        status: 'pending',
        timestamp: new Date().toISOString(),
        estimatedTime: quote.estimatedTime
      };

      // Store transaction in Supabase
      const { error } = await supabase
        .from('cross_chain_transactions')
        .insert({
          id: transaction.id,
          from_network: transaction.fromNetwork,
          to_network: transaction.toNetwork,
          from_address: transaction.fromAddress,
          to_address: transaction.toAddress,
          amount: transaction.amount,
          theo_amount: transaction.theoAmount,
          status: transaction.status,
          estimated_time: transaction.estimatedTime
        });

      if (error) {
        console.error('Error storing cross-chain transaction:', error);
      }

      // Simulate bridge process
      this.processBridge(transaction);

      return transaction;
    } catch (error) {
      console.error('Error initiating bridge:', error);
      throw error;
    }
  }

  private async processBridge(transaction: CrossChainTransaction): Promise<void> {
    try {
      // Simulate the bridging process
      setTimeout(async () => {
        // Update status to bridging
        transaction.status = 'bridging';
        transaction.txHash = `0x${Math.random().toString(16).slice(2, 66)}`;
        
        await this.updateTransactionStatus(transaction);
        
        // Simulate bridge completion
        setTimeout(async () => {
          transaction.status = 'completed';
          transaction.bridgeTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;
          
          await this.updateTransactionStatus(transaction);
        }, transaction.estimatedTime * 60 * 1000); // Convert minutes to milliseconds
        
      }, 30000); // 30 seconds initial delay
      
    } catch (error) {
      console.error('Error processing bridge:', error);
      transaction.status = 'failed';
      await this.updateTransactionStatus(transaction);
    }
  }

  private async updateTransactionStatus(transaction: CrossChainTransaction): Promise<void> {
    try {
      const { error } = await supabase
        .from('cross_chain_transactions')
        .update({
          status: transaction.status,
          tx_hash: transaction.txHash,
          bridge_tx_hash: transaction.bridgeTxHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      if (error) {
        console.error('Error updating transaction status:', error);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  }

  async getTransactionHistory(userAddress: string): Promise<CrossChainTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('cross_chain_transactions')
        .select('*')
        .or(`from_address.eq.${userAddress},to_address.eq.${userAddress}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }

      return data.map(tx => ({
        id: tx.id,
        fromNetwork: tx.from_network,
        toNetwork: tx.to_network,
        fromAddress: tx.from_address,
        toAddress: tx.to_address,
        amount: tx.amount,
        theoAmount: tx.theo_amount,
        status: tx.status,
        txHash: tx.tx_hash,
        bridgeTxHash: tx.bridge_tx_hash,
        timestamp: tx.created_at,
        estimatedTime: tx.estimated_time
      }));
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  async switchNetwork(networkId: string): Promise<boolean> {
    const network = await this.getNetworkById(networkId);
    if (!network) {
      throw new Error('Network not supported');
    }

    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${network.chainId.toString(16)}`,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: network.nativeCurrency,
              blockExplorerUrls: [network.explorerUrl]
            }],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    }
  }
}

export default CrossChainService;
