import { validateDataIntegrity } from '@/utils/validation';
import { ValidationError, logError, AppError } from '@/utils/errorHandling';
import { z } from 'zod';

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

export class FieldEncryption {
  private static instance: FieldEncryption;
  private encryptionKey?: CryptoKey;
  private keyId: string;

  public static getInstance(): FieldEncryption {
    if (!FieldEncryption.instance) {
      FieldEncryption.instance = new FieldEncryption();
    }
    return FieldEncryption.instance;
  }

  private constructor() {
    this.keyId = 'field-encryption-v1';
    this.initializeEncryption();
  }

  private async initializeEncryption(): Promise<void> {
    try {
      // In a production environment, this key would come from a secure key management service
      // For now, we'll generate or retrieve a key from secure storage
      const keyData = localStorage.getItem('encryption-key');
      
      if (keyData) {
        // Import existing key
        const keyBuffer = new Uint8Array(JSON.parse(keyData));
        this.encryptionKey = await crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
      } else {
        // Generate new key
        this.encryptionKey = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        
        // Export and store the key (in production, use secure key storage)
        const exportedKey = await crypto.subtle.exportKey('raw', this.encryptionKey);
        localStorage.setItem('encryption-key', JSON.stringify(Array.from(new Uint8Array(exportedKey))));
      }
    } catch (error) {
      const appError = new ValidationError('Encryption initialization failed', { originalError: error });
      logError(appError);
      throw appError;
    }
  }

  public async encryptField(data: string, fieldType: 'pii' | 'medical' | 'sensitive' = 'sensitive'): Promise<EncryptionResult> {
    try {
      if (!this.encryptionKey) {
        await this.initializeEncryption();
      }

      if (!this.encryptionKey) {
        throw new ValidationError('Encryption key not available');
      }

      // Validate input data - use proper Zod schema
      validateDataIntegrity(data, z.string().min(1, 'Data cannot be empty'));

      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combinedBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combinedBuffer.set(iv);
      combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length);

      // Create base64 encoded result
      const encryptedData = btoa(String.fromCharCode(...combinedBuffer));
      
      // Generate checksum for integrity verification
      const checksum = await this.generateChecksum(encryptedData);
      
      return {
        encryptedData,
        metadata: {
          algorithm: 'AES-GCM-256',
          keyId: this.keyId,
          timestamp: new Date().toISOString(),
          checksum
        }
      };
    } catch (error) {
      const appError = error instanceof AppError ? error : new ValidationError('Failed to encrypt field data', { originalError: error });
      logError(appError);
      throw appError;
    }
  }

  public async decryptField(encryptedResult: EncryptionResult): Promise<DecryptionResult> {
    try {
      if (!this.encryptionKey) {
        await this.initializeEncryption();
      }

      if (!this.encryptionKey) {
        throw new ValidationError('Encryption key not available');
      }

      // Verify checksum first
      const expectedChecksum = await this.generateChecksum(encryptedResult.encryptedData);
      if (expectedChecksum !== encryptedResult.metadata.checksum) {
        return {
          decryptedData: '',
          isValid: false,
          metadata: { error: 'Checksum verification failed' }
        };
      }

      // Decode base64
      const combinedBuffer = new Uint8Array(
        atob(encryptedResult.encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combinedBuffer.slice(0, 12);
      const encryptedData = combinedBuffer.slice(12);

      // Decrypt
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encryptedData
      );

      const decoder = new TextDecoder();
      const decryptedData = decoder.decode(decryptedBuffer);

      return {
        decryptedData,
        isValid: true,
        metadata: encryptedResult.metadata
      };
    } catch (error) {
      const appError = error instanceof AppError ? error : new ValidationError('Decryption failed', { originalError: error });
      logError(appError);
      return {
        decryptedData: '',
        isValid: false,
        metadata: { error: 'Decryption failed' }
      };
    }
  }

  private async generateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    return btoa(String.fromCharCode(...hashArray)).substring(0, 16);
  }

  public async encryptSensitiveFields(obj: Record<string, any>, fieldsToEncrypt: string[]): Promise<Record<string, any>> {
    const result = { ...obj };
    
    for (const field of fieldsToEncrypt) {
      if (result[field] && typeof result[field] === 'string') {
        const encrypted = await this.encryptField(result[field]);
        result[field] = encrypted;
      }
    }
    
    return result;
  }

  public async decryptSensitiveFields(obj: Record<string, any>, fieldsToDecrypt: string[]): Promise<Record<string, any>> {
    const result = { ...obj };
    
    for (const field of fieldsToDecrypt) {
      if (result[field] && typeof result[field] === 'object' && result[field].encryptedData) {
        const decrypted = await this.decryptField(result[field]);
        result[field] = decrypted.isValid ? decrypted.decryptedData : '[DECRYPTION FAILED]';
      }
    }
    
    return result;
  }
}

export default FieldEncryption;
