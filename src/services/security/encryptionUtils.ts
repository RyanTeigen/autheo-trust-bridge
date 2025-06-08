
import { ValidationError, logError, AppError } from '@/utils/errorHandling';

export class EncryptionKeyManager {
  private static keyId = 'field-encryption-v1';

  public static async generateOrRetrieveKey(): Promise<CryptoKey> {
    try {
      const keyData = localStorage.getItem('encryption-key');
      
      if (keyData) {
        // Import existing key
        const keyBuffer = new Uint8Array(JSON.parse(keyData));
        return await crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
      } else {
        // Generate new key
        const newKey = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        
        // Export and store the key (in production, use secure key storage)
        const exportedKey = await crypto.subtle.exportKey('raw', newKey);
        localStorage.setItem('encryption-key', JSON.stringify(Array.from(new Uint8Array(exportedKey))));
        
        return newKey;
      }
    } catch (error) {
      const appError = new ValidationError('Encryption key generation/retrieval failed', { originalError: error });
      logError(appError);
      throw appError;
    }
  }

  public static getKeyId(): string {
    return this.keyId;
  }
}

export class CryptoOperations {
  public static async encryptData(data: string, key: CryptoKey): Promise<{ encryptedData: string; iv: Uint8Array }> {
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
  }

  public static async decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
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
  }
}
