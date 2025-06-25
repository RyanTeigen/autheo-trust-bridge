
export interface NetworkConfig {
  rpcUrl: string;
  contractAddress: string;
  explorerUrl: string;
  chainId: number;
  networkName: string;
}

export class BlockchainConfig {
  // Autheo Network RPC endpoints
  public static readonly AUTHEO_TESTNET_RPC = 'https://testnet-rpc2.autheo.com';
  public static readonly AUTHEO_MAINNET_RPC = 'https://rpc.autheo.io';
  
  // Contract addresses
  public static readonly TESTNET_CONTRACT = '0x123d35Cc8Ba6458b4b9395Fa3a44b4b8D4E6F8Cf';
  public static readonly MAINNET_CONTRACT = '0x742d35Cc8Ba6458b4b9395Fa3a44b4b8D4E6F8Cf';
  
  // Explorer URLs
  public static readonly TESTNET_EXPLORER = 'https://testnet-explorer.autheo.io';
  public static readonly MAINNET_EXPLORER = 'https://explorer.autheo.io';
  
  // Chain IDs
  public static readonly TESTNET_CHAIN_ID = 3;
  public static readonly MAINNET_CHAIN_ID = 1;

  public static getNetworkConfig(useMainnet: boolean = false): NetworkConfig {
    return {
      rpcUrl: useMainnet ? this.AUTHEO_MAINNET_RPC : this.AUTHEO_TESTNET_RPC,
      contractAddress: useMainnet ? this.MAINNET_CONTRACT : this.TESTNET_CONTRACT,
      explorerUrl: useMainnet ? this.MAINNET_EXPLORER : this.TESTNET_EXPLORER,
      chainId: useMainnet ? this.MAINNET_CHAIN_ID : this.TESTNET_CHAIN_ID,
      networkName: useMainnet ? 'Autheo Mainnet' : 'Autheo Testnet'
    };
  }

  public static getExplorerUrl(transactionHash: string, useMainnet: boolean = false): string {
    const baseUrl = useMainnet ? this.MAINNET_EXPLORER : this.TESTNET_EXPLORER;
    return `${baseUrl}/tx/${transactionHash}`;
  }
}
