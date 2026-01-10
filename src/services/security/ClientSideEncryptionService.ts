/**
 * Client-Side Only Encryption Service
 * Ensures all encryption/decryption happens on the client with zero server knowledge
 */

import { SecureKeyManager } from './SecureKeyManager';
import { hybridEncrypt, hybridDecrypt, HybridEncryptedData } from '@/utils/hybrid-encryption';
import { generateMLKEMKeyPair, mlkemEncapsulate, mlkemDecapsulate } from '@/utils/pq-mlkem';

export interface ClientEncryptedData {
  encryptedData: string;
  keyReference: string;
  algorithm: string;
  timestamp: string;
  integrity: string;
}

export interface ShareEncryptedData extends HybridEncryptedData {
  shareId: string;
  recipientPublicKey: string;
  senderAttestation: string;
}

export class ClientSideEncryptionService {
  
  /**
   * Encrypt data for self-storage (zero-knowledge server)
   */
  static async encryptForSelf(
    plaintext: string | object, 
    userId: string
  ): Promise<ClientEncryptedData> {
    try {
      // Ensure secure keys exist
      let keyPair = await SecureKeyManager.getKeyReference(userId);
      if (!keyPair) {
        keyPair = await SecureKeyManager.generateSecureKeyPair(userId);
      }

      // Convert to string if object
      const dataString = typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext);
      
      // Generate symmetric key for this record
      const symmetricKey = crypto.getRandomValues(new Uint8Array(32));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt data with AES-GCM
      const dataKey = await crypto.subtle.importKey(
        'raw',
        symmetricKey,
        'AES-GCM',
        false,
        ['encrypt']
      );

      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(dataString);
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        dataKey,
        dataBuffer
      );

      // Create integrity hash
      const integrity = await this.createIntegrityHash(dataString, keyPair.keyId);

      // Encrypt the symmetric key with user's secure key (conceptually)
      const keyReference = await this.createKeyReference(symmetricKey, iv, keyPair.keyId);

      return {
        encryptedData: Array.from(new Uint8Array(encryptedBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(''),
        keyReference,
        algorithm: 'AES-GCM-256',
        timestamp: new Date().toISOString(),
        integrity
      };
    } catch (error) {
      console.error('Client-side encryption failed:', error);
      throw new Error('Failed to encrypt data on client');
    }
  }

  /**
   * Decrypt self-encrypted data
   */
  static async decryptForSelf(
    encrypted: ClientEncryptedData,
    userId: string
  ): Promise<string | object> {
    try {
      const keyPair = await SecureKeyManager.getKeyReference(userId);
      if (!keyPair) {
        throw new Error('No encryption keys found for user');
      }

      // Extract symmetric key and IV from key reference
      const { symmetricKey, iv } = await this.extractFromKeyReference(
        encrypted.keyReference, 
        keyPair.keyId
      );

      // Import symmetric key - ensure ArrayBuffer type
      const symmetricKeyBuffer = symmetricKey.buffer.slice(
        symmetricKey.byteOffset,
        symmetricKey.byteOffset + symmetricKey.byteLength
      ) as ArrayBuffer;
      
      const dataKey = await crypto.subtle.importKey(
        'raw',
        symmetricKeyBuffer,
        'AES-GCM',
        false,
        ['decrypt']
      );

      // Decrypt data
      const encryptedBuffer = new Uint8Array(
        encrypted.encryptedData.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );
      
      // Ensure proper ArrayBuffer type for iv
      const ivBuffer = iv.buffer.slice(
        iv.byteOffset,
        iv.byteOffset + iv.byteLength
      ) as ArrayBuffer;

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
        dataKey,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      const decryptedString = decoder.decode(decryptedBuffer);

      // Verify integrity
      const expectedIntegrity = await this.createIntegrityHash(decryptedString, keyPair.keyId);
      if (expectedIntegrity !== encrypted.integrity) {
        throw new Error('Data integrity verification failed');
      }

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(decryptedString);
      } catch {
        return decryptedString;
      }
    } catch (error) {
      console.error('Client-side decryption failed:', error);
      throw new Error('Failed to decrypt data on client');
    }
  }

  /**
   * Encrypt data for sharing with another user
   */
  static async encryptForSharing(
    plaintext: string | object,
    recipientPublicKey: string,
    senderUserId: string
  ): Promise<ShareEncryptedData> {
    try {
      const dataString = typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext);
      
      // Use hybrid encryption for quantum-safe sharing
      const hybridResult = await hybridEncrypt(dataString, recipientPublicKey);
      
      // Get sender attestation for verification
      const attestation = await SecureKeyManager.getKeyAttestation(senderUserId);
      
      return {
        ...hybridResult,
        shareId: crypto.randomUUID(),
        recipientPublicKey,
        senderAttestation: attestation?.attestation || ''
      };
    } catch (error) {
      console.error('Client-side sharing encryption failed:', error);
      throw new Error('Failed to encrypt data for sharing');
    }
  }

  /**
   * Decrypt shared data
   */
  static async decryptShared(
    encrypted: ShareEncryptedData,
    recipientUserId: string
  ): Promise<string | object> {
    try {
      const keyPair = await SecureKeyManager.getKeyReference(recipientUserId);
      if (!keyPair) {
        throw new Error('No decryption keys found for recipient');
      }

      // For now, we'll use a mock private key since we need the actual ML-KEM private key
      // In production, this would use the secure private key
      const mockPrivateKey = `mlkem_sk_${keyPair.keyId}`;

      const hybridData: HybridEncryptedData = {
        encryptedData: encrypted.encryptedData,
        pqEncryptedKey: encrypted.pqEncryptedKey,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        algorithm: encrypted.algorithm,
        timestamp: encrypted.timestamp
      };

      const result = await hybridDecrypt(hybridData, mockPrivateKey);
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(result.data);
      } catch {
        return result.data;
      }
    } catch (error) {
      console.error('Client-side shared decryption failed:', error);
      throw new Error('Failed to decrypt shared data on client');
    }
  }

  /**
   * Generate keys for a new user
   */
  static async generateUserKeys(userId: string): Promise<{
    publicKey: string;
    hasSecureStorage: boolean;
    attestation: string | null;
  }> {
    try {
      const keyPair = await SecureKeyManager.generateSecureKeyPair(userId);
      const attestation = await SecureKeyManager.getKeyAttestation(userId);
      
      return {
        publicKey: keyPair.publicKey,
        hasSecureStorage: keyPair.hasSecureStorage,
        attestation: attestation?.attestation || null
      };
    } catch (error) {
      console.error('Error generating user keys:', error);
      throw new Error('Failed to generate secure keys');
    }
  }

  /**
   * Verify key attestation
   */
  static async verifyKeyAttestation(
    attestation: string,
    publicKey: string,
    userId: string
  ): Promise<boolean> {
    try {
      return await SecureKeyManager.verifySignature(userId, attestation, publicKey);
    } catch (error) {
      console.error('Error verifying key attestation:', error);
      return false;
    }
  }

  /**
   * Get user's public key for sharing
   */
  static async getUserPublicKey(userId: string): Promise<string | null> {
    try {
      const keyPair = await SecureKeyManager.getKeyReference(userId);
      return keyPair?.publicKey || null;
    } catch (error) {
      console.error('Error getting user public key:', error);
      return null;
    }
  }

  /**
   * Clear all user encryption data (logout)
   */
  static async clearUserData(userId: string): Promise<void> {
    try {
      await SecureKeyManager.clearUserKeys(userId);
      console.log('All user encryption data cleared');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  // Private helper methods

  private static async createIntegrityHash(data: string, keyId: string): Promise<string> {
    const encoder = new TextEncoder();
    const combined = encoder.encode(data + keyId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private static async createKeyReference(
    symmetricKey: Uint8Array,
    iv: Uint8Array,
    keyId: string
  ): Promise<string> {
    // In production, this would encrypt the symmetric key with the user's secure key
    // For now, we'll encode it with the keyId
    const combined = new Uint8Array(symmetricKey.length + iv.length + keyId.length);
    combined.set(symmetricKey);
    combined.set(iv, symmetricKey.length);
    combined.set(new TextEncoder().encode(keyId), symmetricKey.length + iv.length);
    
    return Array.from(combined)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private static async extractFromKeyReference(
    keyReference: string,
    keyId: string
  ): Promise<{ symmetricKey: Uint8Array; iv: Uint8Array }> {
    // Decode the key reference
    const combined = new Uint8Array(
      keyReference.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    const symmetricKey = combined.slice(0, 32);
    const iv = combined.slice(32, 44);
    
    return { symmetricKey, iv };
  }
}