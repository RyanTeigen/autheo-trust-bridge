
import { ValidationError, logError, AppError } from '@/utils/errorHandling';

export class EncryptionKeyManager {
  private static keyId = 'field-encryption-v1';
  private static keyStorageName = 'encryption-key';

  public static async generateOrRetrieveKey(): Promise<CryptoKey> {
    try {
      // First, try to get existing key from localStorage
      const keyData = localStorage.getItem(this.keyStorageName);
      
      if (keyData) {
        try {
          // Import existing key
          const keyBuffer = new Uint8Array(JSON.parse(keyData));
          const importedKey = await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
          );
          console.log('Encryption key retrieved from localStorage');
          return importedKey;
        } catch (importError) {
          console.warn('Failed to import existing key, generating new one:', importError);
          // Clear invalid key and generate new one
          localStorage.removeItem(this.keyStorageName);
        }
      }

      // Generate new key
      console.log('Generating new encryption key');
      const newKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      // Export and store the key
      const exportedKey = await crypto.subtle.exportKey('raw', newKey);
      const keyArray = Array.from(new Uint8Array(exportedKey));
      localStorage.setItem(this.keyStorageName, JSON.stringify(keyArray));
      
      console.log('New encryption key generated and stored');
      return newKey;
    } catch (error) {
      console.error('Critical error in encryption key management:', error);
      const appError = new ValidationError('Encryption key generation/retrieval failed', { originalError: error });
      logError(appError);
      throw appError;
    }
  }

  public static getKeyId(): string {
    return this.keyId;
  }

  public static clearKeys(): void {
    try {
      localStorage.removeItem(this.keyStorageName);
      console.log('Encryption keys cleared');
    } catch (error) {
      console.error('Error clearing encryption keys:', error);
    }
  }

  public static hasKeys(): boolean {
    return localStorage.getItem(this.keyStorageName) !== null;
  }
}

export class CryptoOperations {
  public static async encryptData(data: string, key: CryptoKey): Promise<{ encryptedData: string; iv: Uint8Array }> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combinedBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combinedBuffer.set(iv);
      combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length);

      // Create base64 encoded result
      const encryptedData = btoa(String.fromCharCode(...combinedBuffer));
      
      return { encryptedData, iv };
    } catch (error) {
      console.error('Encryption operation failed:', error);
      throw new ValidationError('Data encryption failed', { originalError: error });
    }
  }

  public static async decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
    try {
      // Decode base64
      const combinedBuffer = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combinedBuffer.slice(0, 12);
      const encryptedDataBuffer = combinedBuffer.slice(12);

      // Decrypt
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedDataBuffer
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption operation failed:', error);
      throw new ValidationError('Data decryption failed', { originalError: error });
    }
  }
}
