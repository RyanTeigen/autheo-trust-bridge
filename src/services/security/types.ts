
export interface EncryptionResult {
  encryptedData: string;
  metadata: {
    algorithm: string;
    keyId: string;
    timestamp: string;
    checksum: string;
  };
}

export interface DecryptionResult {
  decryptedData: string;
  isValid: boolean;
  metadata?: any;
}

export type FieldType = 'pii' | 'medical' | 'sensitive';
