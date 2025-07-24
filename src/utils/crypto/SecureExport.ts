// src/utils/crypto/SecureExport.ts
// Secure replacement for export.ts with localStorage vulnerabilities

import { getOrCreateAESKey } from '@/utils/encryption/SecureKeys';

/**
 * Secure AES-256-GCM encryption utilities for record export
 * Replaces the insecure localStorage-based approach
 */

export async function encryptWithSecureKey(plaintext: string): Promise<string> {
  try {
    // Get secure key instead of localStorage
    const hexKey = await getOrCreateAESKey();
    
    // Convert hex key to ArrayBuffer
    const keyBuffer = new Uint8Array(hexKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Import key for Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      'AES-GCM',
      false,
      ['encrypt']
    );
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    
    // Encrypt the data
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    );
    
    // Generate authentication tag (included in GCM output)
    const encryptedArray = new Uint8Array(encrypted);
    
    // Combine IV + encrypted data for storage
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);
    
    // Create secure payload
    const payload = {
      version: '2.0', // Version to distinguish from legacy format
      data: Array.from(combined).map(b => b.toString(16).padStart(2, '0')).join(''),
      timestamp: new Date().toISOString(),
      algorithm: 'AES-256-GCM'
    };
    
    return JSON.stringify(payload);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data securely');
  }
}

export async function decryptWithSecureKey(payload: string): Promise<string> {
  try {
    const data = JSON.parse(payload);
    
    // Handle legacy format (insecure, but needed for migration)
    if (!data.version || data.version === '1.0') {
      console.warn('Decrypting legacy format - consider re-encrypting with secure method');
      return atob(data.encrypted);
    }
    
    // Secure format (version 2.0+)
    if (data.version !== '2.0') {
      throw new Error(`Unsupported payload version: ${data.version}`);
    }
    
    // Get secure key
    const hexKey = await getOrCreateAESKey();
    const keyBuffer = new Uint8Array(hexKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Import key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      'AES-GCM',
      false,
      ['decrypt']
    );
    
    // Parse combined data
    const combinedArray = new Uint8Array(data.data.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)));
    const iv = combinedArray.slice(0, 12);
    const encryptedData = combinedArray.slice(12);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Migration function to upgrade legacy encrypted data
 */
export async function migrateLegacyEncryption(legacyPayload: string): Promise<string> {
  try {
    // First decrypt with legacy method
    const decrypted = await decryptWithSecureKey(legacyPayload);
    
    // Re-encrypt with secure method
    return await encryptWithSecureKey(decrypted);
  } catch (error) {
    console.error('Migration failed:', error);
    throw new Error('Failed to migrate legacy encryption');
  }
}

/**
 * Secure key derivation for user-specific encryption
 */
export async function deriveUserSpecificKey(baseKey: string, userId: string, context: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    
    // Import base key
    const baseKeyBuffer = new Uint8Array(baseKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      baseKeyBuffer,
      'HKDF',
      false,
      ['deriveKey']
    );
    
    // Derive user-specific key
    const info = encoder.encode(`${context}:${userId}`);
    const salt = encoder.encode('autheo-secure-2024');
    
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt,
        info
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Export as hex string
    const exported = await crypto.subtle.exportKey('raw', derivedKey);
    return Array.from(new Uint8Array(exported))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Key derivation failed:', error);
    throw new Error('Failed to derive user-specific key');
  }
}

// Legacy compatibility functions (deprecated)
/** @deprecated Use encryptWithSecureKey() instead */
export const encryptWithKey = async (plaintext: string, _key: string): Promise<string> => {
  console.warn('encryptWithKey is deprecated and insecure. Use encryptWithSecureKey() instead.');
  return encryptWithSecureKey(plaintext);
};

/** @deprecated Use decryptWithSecureKey() instead */
export const decryptWithKey = async (payload: string, _key: string): Promise<string> => {
  console.warn('decryptWithKey is deprecated and insecure. Use decryptWithSecureKey() instead.');
  return decryptWithSecureKey(payload);
};

/** @deprecated Use secure key management instead */
export const getUserEncryptionKey = async (): Promise<string> => {
  console.warn('getUserEncryptionKey is deprecated and insecure. Use secure key management instead.');
  return getOrCreateAESKey();
};