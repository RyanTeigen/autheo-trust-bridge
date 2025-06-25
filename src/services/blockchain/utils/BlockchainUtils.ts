
import Web3 from 'web3';
import { BlockchainConfig } from '../config/BlockchainConfig';

export class BlockchainUtils {
  /**
   * Generate a blockchain explorer URL for a transaction
   */
  static getExplorerUrl(transactionHash: string, useMainnet: boolean = false): string {
    return BlockchainConfig.getExplorerUrl(transactionHash, useMainnet);
  }

  /**
   * Create a data payload for blockchain anchoring
   */
  static createDataPayload(auditHash: string): string {
    return Web3.utils.keccak256(auditHash);
  }

  /**
   * Validate transaction hash format
   */
  static isValidTransactionHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }

  /**
   * Validate Ethereum address format
   */
  static isValidAddress(address: string): boolean {
    return Web3.utils.isAddress(address);
  }

  /**
   * Convert Wei to Ether
   */
  static weiToEther(wei: string | number): string {
    return Web3.utils.fromWei(wei.toString(), 'ether');
  }

  /**
   * Convert Ether to Wei
   */
  static etherToWei(ether: string | number): string {
    return Web3.utils.toWei(ether.toString(), 'ether');
  }
}
