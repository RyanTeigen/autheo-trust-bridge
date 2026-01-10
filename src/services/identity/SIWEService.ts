/**
 * Sign-In with Ethereum (SIWE) Service for Autheo
 * Implements EIP-4361 for decentralized authentication
 */

export interface SIWEMessage {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

export interface SIWEVerificationResult {
  valid: boolean;
  address?: string;
  did?: string;
  error?: string;
}

// Autheo chain ID
const AUTHEO_CHAIN_ID = 785;

export class SIWEService {
  private domain: string;
  private uri: string;

  constructor(domain?: string, uri?: string) {
    this.domain = domain || window.location.host;
    this.uri = uri || window.location.origin;
  }

  /**
   * Generate a cryptographically secure nonce
   */
  generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Create a SIWE message for signing
   */
  createMessage(
    address: string,
    nonce: string,
    options?: {
      statement?: string;
      expirationMinutes?: number;
      chainId?: number;
      resources?: string[];
    }
  ): SIWEMessage {
    const now = new Date();
    const expirationTime = options?.expirationMinutes 
      ? new Date(now.getTime() + options.expirationMinutes * 60 * 1000)
      : new Date(now.getTime() + 15 * 60 * 1000); // Default 15 minutes

    return {
      domain: this.domain,
      address: address,
      statement: options?.statement || 'Sign in to Autheo Health with your decentralized identity.',
      uri: this.uri,
      version: '1',
      chainId: options?.chainId || AUTHEO_CHAIN_ID,
      nonce: nonce,
      issuedAt: now.toISOString(),
      expirationTime: expirationTime.toISOString(),
      resources: options?.resources || [
        'https://autheo.com/terms',
        'https://autheo.com/privacy'
      ]
    };
  }

  /**
   * Format SIWE message as a human-readable string for signing
   * Follows EIP-4361 format
   */
  formatMessage(message: SIWEMessage): string {
    const lines: string[] = [
      `${message.domain} wants you to sign in with your Ethereum account:`,
      message.address,
      '',
      message.statement,
      '',
      `URI: ${message.uri}`,
      `Version: ${message.version}`,
      `Chain ID: ${message.chainId}`,
      `Nonce: ${message.nonce}`,
      `Issued At: ${message.issuedAt}`
    ];

    if (message.expirationTime) {
      lines.push(`Expiration Time: ${message.expirationTime}`);
    }

    if (message.notBefore) {
      lines.push(`Not Before: ${message.notBefore}`);
    }

    if (message.requestId) {
      lines.push(`Request ID: ${message.requestId}`);
    }

    if (message.resources && message.resources.length > 0) {
      lines.push('Resources:');
      message.resources.forEach(resource => {
        lines.push(`- ${resource}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Parse a signed SIWE message string back to object
   */
  parseMessage(messageString: string): SIWEMessage | null {
    try {
      const lines = messageString.split('\n');
      
      // Extract domain from first line
      const domainMatch = lines[0]?.match(/^(.+) wants you to sign in/);
      const domain = domainMatch?.[1] || '';
      
      // Address is on line 2
      const address = lines[1] || '';
      
      // Statement is on line 4
      const statement = lines[3] || '';
      
      // Parse key-value pairs
      const getValue = (prefix: string): string | undefined => {
        const line = lines.find(l => l.startsWith(prefix));
        return line ? line.substring(prefix.length).trim() : undefined;
      };

      const uri = getValue('URI: ') || '';
      const version = getValue('Version: ') || '1';
      const chainId = parseInt(getValue('Chain ID: ') || String(AUTHEO_CHAIN_ID), 10);
      const nonce = getValue('Nonce: ') || '';
      const issuedAt = getValue('Issued At: ') || new Date().toISOString();
      const expirationTime = getValue('Expiration Time: ');
      const notBefore = getValue('Not Before: ');
      const requestId = getValue('Request ID: ');

      // Parse resources
      const resourcesIndex = lines.findIndex(l => l === 'Resources:');
      const resources: string[] = [];
      if (resourcesIndex !== -1) {
        for (let i = resourcesIndex + 1; i < lines.length; i++) {
          if (lines[i].startsWith('- ')) {
            resources.push(lines[i].substring(2));
          }
        }
      }

      return {
        domain,
        address,
        statement,
        uri,
        version,
        chainId,
        nonce,
        issuedAt,
        expirationTime,
        notBefore,
        requestId,
        resources: resources.length > 0 ? resources : undefined
      };
    } catch (error) {
      console.error('Failed to parse SIWE message:', error);
      return null;
    }
  }

  /**
   * Verify a SIWE signature
   */
  async verifySignature(
    message: string,
    signature: string,
    expectedAddress: string
  ): Promise<SIWEVerificationResult> {
    try {
      const { ethers } = await import('ethers');
      
      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      // Check if recovered address matches expected
      if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
        return {
          valid: false,
          error: 'Signature does not match the expected address'
        };
      }

      // Parse the message to validate structure
      const parsedMessage = this.parseMessage(message);
      if (!parsedMessage) {
        return {
          valid: false,
          error: 'Invalid message format'
        };
      }

      // Check expiration
      if (parsedMessage.expirationTime) {
        const expiration = new Date(parsedMessage.expirationTime);
        if (expiration < new Date()) {
          return {
            valid: false,
            error: 'Message has expired'
          };
        }
      }

      // Check notBefore
      if (parsedMessage.notBefore) {
        const notBefore = new Date(parsedMessage.notBefore);
        if (notBefore > new Date()) {
          return {
            valid: false,
            error: 'Message is not yet valid'
          };
        }
      }

      // Generate DID from verified address
      const did = `did:autheo:${recoveredAddress.toLowerCase()}`;

      return {
        valid: true,
        address: recoveredAddress,
        did
      };
    } catch (error) {
      console.error('SIWE verification error:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Validate message fields
   */
  validateMessage(message: SIWEMessage): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!message.domain) errors.push('Domain is required');
    if (!message.address) errors.push('Address is required');
    if (!/^0x[a-fA-F0-9]{40}$/.test(message.address)) {
      errors.push('Invalid Ethereum address format');
    }
    if (!message.nonce) errors.push('Nonce is required');
    if (message.nonce.length < 8) errors.push('Nonce must be at least 8 characters');
    if (!message.issuedAt) errors.push('Issued At is required');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const siweService = new SIWEService();
