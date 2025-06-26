
import { validateDataIntegrity } from '@/utils/validation';
import { ValidationError, logError, AppError } from '@/utils/errorHandling';
import { z } from 'zod';
import { EncryptionResult, DecryptionResult, FieldType } from './types';
import { EncryptionKeyManager, CryptoOperations } from './encryptionUtils';
import { ChecksumGenerator } from './checksumUtils';

export class FieldEncryption {
  private static instance: FieldEncryption;
  private encryptionKey?: CryptoKey;
  private isInitialized = false;
  private initializationPromise?: Promise<void>;

  public static getInstance(): FieldEncryption {
    if (!FieldEncryption.instance) {
      FieldEncryption.instance = new FieldEncryption();
    }
    return FieldEncryption.instance;
  }

  private constructor() {
    // Don't initialize in constructor to avoid async issues
  }

  private async initializeEncryption(): Promise<void> {
    // Return existing promise if already initializing
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // If already initialized, return immediately
    if (this.isInitialized && this.encryptionKey) {
      return Promise.resolve();
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  private async _performInitialization(): Promise<void> {
    try {
      console.log('Starting field encryption initialization...');
      this.encryptionKey = await EncryptionKeyManager.generateOrRetrieveKey();
      this.isInitialized = true;
      console.log('Field encryption initialized successfully');
    } catch (error) {
      console.error('Field encryption initialization failed:', error);
      const appError = new ValidationError('Encryption initialization failed', { originalError: error });
      logError(appError);
      this.isInitialized = false;
      this.encryptionKey = undefined;
      // Clear the promise so it can be retried
      this.initializationPromise = undefined;
      throw appError;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized || !this.encryptionKey) {
      console.log('Encryption not initialized, initializing now...');
      await this.initializeEncryption();
    }
  }

  public async encryptField(data: string, fieldType: FieldType = 'sensitive'): Promise<EncryptionResult> {
    try {
      await this.ensureInitialized();

      if (!this.encryptionKey) {
        throw new ValidationError('Encryption key not available after initialization');
      }

      // Validate input data - use proper Zod schema
      validateDataIntegrity(data, z.string().min(1, 'Data cannot be empty'));

      const { encryptedData } = await CryptoOperations.encryptData(data, this.encryptionKey);
      
      // Generate checksum for integrity verification
      const checksum = await ChecksumGenerator.generateChecksum(encryptedData);
      
      return {
        encryptedData,
        metadata: {
          algorithm: 'AES-GCM-256',
          keyId: EncryptionKeyManager.getKeyId(),
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
      await this.ensureInitialized();

      if (!this.encryptionKey) {
        throw new ValidationError('Encryption key not available after initialization');
      }

      // Verify checksum first
      const isChecksumValid = await ChecksumGenerator.verifyChecksum(
        encryptedResult.encryptedData, 
        encryptedResult.metadata.checksum
      );
      
      if (!isChecksumValid) {
        return {
          decryptedData: '',
          isValid: false,
          metadata: { error: 'Checksum verification failed' }
        };
      }

      const decryptedData = await CryptoOperations.decryptData(
        encryptedResult.encryptedData, 
        this.encryptionKey
      );

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

  // Public method to check if encryption is ready
  public isReady(): boolean {
    return this.isInitialized && !!this.encryptionKey;
  }

  // Public method to manually initialize if needed
  public async initialize(): Promise<void> {
    await this.initializeEncryption();
  }

  // Reset the encryption system (useful for testing or recovery)
  public reset(): void {
    this.isInitialized = false;
    this.encryptionKey = undefined;
    this.initializationPromise = undefined;
    console.log('Encryption system reset');
  }
}

export default FieldEncryption;
