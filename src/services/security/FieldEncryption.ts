
import { validateDataIntegrity } from '@/utils/validation';
import { ValidationError, logError, AppError } from '@/utils/errorHandling';
import { z } from 'zod';
import { EncryptionResult, DecryptionResult, FieldType } from './types';
import { EncryptionKeyManager, CryptoOperations } from './encryptionUtils';
import { ChecksumGenerator } from './checksumUtils';

export class FieldEncryption {
  private static instance: FieldEncryption;
  private encryptionKey?: CryptoKey;

  public static getInstance(): FieldEncryption {
    if (!FieldEncryption.instance) {
      FieldEncryption.instance = new FieldEncryption();
    }
    return FieldEncryption.instance;
  }

  private constructor() {
    this.initializeEncryption();
  }

  private async initializeEncryption(): Promise<void> {
    try {
      this.encryptionKey = await EncryptionKeyManager.generateOrRetrieveKey();
    } catch (error) {
      const appError = new ValidationError('Encryption initialization failed', { originalError: error });
      logError(appError);
      throw appError;
    }
  }

  public async encryptField(data: string, fieldType: FieldType = 'sensitive'): Promise<EncryptionResult> {
    try {
      if (!this.encryptionKey) {
        await this.initializeEncryption();
      }

      if (!this.encryptionKey) {
        throw new ValidationError('Encryption key not available');
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
      if (!this.encryptionKey) {
        await this.initializeEncryption();
      }

      if (!this.encryptionKey) {
        throw new ValidationError('Encryption key not available');
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
}

export default FieldEncryption;
