/**
 * Autheo Decentralized Identity (DID) Service
 * Implements W3C DID Core specification for Autheo blockchain
 */

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyHex?: string;
  blockchainAccountId?: string;
}

export interface DIDDocument {
  '@context': string[];
  id: string;
  controller: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  created?: string;
  updated?: string;
}

export interface DIDResolutionResult {
  didDocument: DIDDocument | null;
  didDocumentMetadata: {
    created?: string;
    updated?: string;
    deactivated?: boolean;
  };
  didResolutionMetadata: {
    error?: string;
    message?: string;
  };
}

// Autheo network configuration
const AUTHEO_CONFIG = {
  mainnet: {
    chainId: 785,
    rpcUrl: 'https://rpc.autheo.com',
    didRegistryEndpoint: 'https://did.autheo.com',
  },
  testnet: {
    chainId: 785,
    rpcUrl: 'https://rpc-testnet.autheo.com',
    didRegistryEndpoint: 'https://didqa.autheo.com',
  }
};

export class AutheoDIDService {
  private network: 'mainnet' | 'testnet';
  
  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network;
  }

  /**
   * Generate a DID from a wallet address
   * Format: did:autheo:<wallet-address>
   */
  generateDID(walletAddress: string): string {
    const normalizedAddress = walletAddress.toLowerCase();
    return `did:autheo:${normalizedAddress}`;
  }

  /**
   * Extract wallet address from a DID
   */
  extractWalletAddress(did: string): string | null {
    const match = did.match(/^did:autheo:(0x[a-fA-F0-9]{40})$/i);
    return match ? match[1].toLowerCase() : null;
  }

  /**
   * Create a DID document for a wallet address
   */
  createDIDDocument(walletAddress: string, publicKey?: string): DIDDocument {
    const did = this.generateDID(walletAddress);
    const now = new Date().toISOString();
    
    const verificationMethods: VerificationMethod[] = [
      {
        id: `${did}#controller`,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: did,
        blockchainAccountId: `eip155:${AUTHEO_CONFIG[this.network].chainId}:${walletAddress}`
      }
    ];

    // Add public key verification method if provided
    if (publicKey) {
      verificationMethods.push({
        id: `${did}#key-1`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: did,
        publicKeyHex: publicKey
      });
    }

    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/secp256k1recovery-2020/v2'
      ],
      id: did,
      controller: did,
      verificationMethod: verificationMethods,
      authentication: verificationMethods.map(vm => vm.id),
      assertionMethod: verificationMethods.map(vm => vm.id),
      created: now,
      updated: now
    };
  }

  /**
   * Resolve a DID to its DID document
   * First attempts to resolve from Autheo DID registry, 
   * falls back to local database
   */
  async resolveDID(did: string): Promise<DIDResolutionResult> {
    try {
      // Validate DID format
      const walletAddress = this.extractWalletAddress(did);
      if (!walletAddress) {
        return {
          didDocument: null,
          didDocumentMetadata: {},
          didResolutionMetadata: {
            error: 'invalidDid',
            message: 'Invalid Autheo DID format'
          }
        };
      }

      // Try to resolve from Autheo DID registry
      try {
        const endpoint = AUTHEO_CONFIG[this.network].didRegistryEndpoint;
        const response = await fetch(`${endpoint}/1.0/identifiers/${did}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          const result = await response.json();
          return {
            didDocument: result.didDocument,
            didDocumentMetadata: result.didDocumentMetadata || {},
            didResolutionMetadata: {}
          };
        }
      } catch (registryError) {
        console.warn('Autheo DID registry unavailable, using local resolution:', registryError);
      }

      // Fallback: Generate DID document from wallet address
      const didDocument = this.createDIDDocument(walletAddress);
      
      return {
        didDocument,
        didDocumentMetadata: {
          created: didDocument.created,
          updated: didDocument.updated
        },
        didResolutionMetadata: {}
      };
    } catch (error) {
      console.error('DID resolution error:', error);
      return {
        didDocument: null,
        didDocumentMetadata: {},
        didResolutionMetadata: {
          error: 'internalError',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Verify that a signature was created by the controller of a DID
   */
  async verifySignature(
    did: string,
    message: string,
    signature: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const walletAddress = this.extractWalletAddress(did);
      if (!walletAddress) {
        return { valid: false, error: 'Invalid DID format' };
      }

      // Use ethers to verify the signature
      const { ethers } = await import('ethers');
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      const valid = recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
      
      return { valid };
    } catch (error) {
      console.error('Signature verification error:', error);
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      };
    }
  }

  /**
   * Get the network configuration
   */
  getNetworkConfig() {
    return AUTHEO_CONFIG[this.network];
  }

  /**
   * Check if a DID is valid Autheo DID format
   */
  isValidDID(did: string): boolean {
    return /^did:autheo:0x[a-fA-F0-9]{40}$/i.test(did);
  }
}

// Export singleton instance
export const autheoDidService = new AutheoDIDService('testnet');
