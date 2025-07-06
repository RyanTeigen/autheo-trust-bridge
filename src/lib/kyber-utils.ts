/**
 * Kyber Cryptography Utilities for Medical Record Encryption
 * Real Kyber-768 (ML-KEM) implementation using mlkem library
 */

import { generateMLKEMKeyPair, mlkemEncapsulate, mlkemDecapsulate } from '@/utils/pq-mlkem';

/**
 * Generate a random AES key for symmetric encryption using Web Crypto API
 * @returns Base64 encoded AES key
 */
export async function generateAESKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
}

/**
 * Encrypt data with AES-GCM using Web Crypto API
 * @param data - The data to encrypt
 * @param key - Base64 encoded AES key
 * @returns Base64 encoded encrypted data with IV
 */
export async function encryptWithAES(data: string, key: string): Promise<string> {
  try {
    const keyBytes = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    const dataBytes = new TextEncoder().encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBytes
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    console.log('🔐 Real AES-GCM encryption performed');
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('AES encryption failed:', error);
    throw new Error(`AES encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt AES key with ML-KEM-768 post-quantum cryptography
 * @param aesKey - The AES key to encrypt
 * @param publicKey - Patient's ML-KEM public key (base64)
 * @returns Base64 encoded ML-KEM encrypted AES key
 */
export async function encryptWithKyber(aesKey: string, publicKey: string): Promise<string> {
  try {
    // Use ML-KEM encapsulation to generate shared secret
    const { ciphertext, sharedSecret } = await mlkemEncapsulate(publicKey);
    
    // Use the shared secret to encrypt the AES key with AES-GCM
    const sharedSecretBytes = Uint8Array.from(sharedSecret.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const aesKeyBytes = new TextEncoder().encode(aesKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      sharedSecretBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const encryptedKey = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      aesKeyBytes
    );
    
    // Combine ciphertext, IV, and encrypted key
    const result = {
      ciphertext,
      iv: btoa(String.fromCharCode(...iv)),
      encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encryptedKey)))
    };
    
    console.log('🔐 Real ML-KEM-768 encryption performed');
    return btoa(JSON.stringify(result));
  } catch (error) {
    console.error('ML-KEM encryption failed:', error);
    throw new Error(`ML-KEM encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt AES-encrypted data using Web Crypto API
 * @param encryptedData - Base64 encoded encrypted data with IV
 * @param key - Base64 encoded AES key
 * @returns Decrypted data
 */
export async function decryptWithAES(encryptedData: string, key: string): Promise<string> {
  try {
    const keyBytes = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    const combinedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combinedBytes.slice(0, 12);
    const encrypted = combinedBytes.slice(12);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );
    
    console.log('🔓 Real AES-GCM decryption performed');
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('AES decryption failed:', error);
    throw new Error(`AES decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt ML-KEM encrypted AES key
 * @param encryptedKey - Base64 encoded ML-KEM encrypted key
 * @param privateKey - Patient's ML-KEM private key (base64)
 * @returns Decrypted AES key
 */
export async function decryptWithKyber(encryptedKey: string, privateKey: string): Promise<string> {
  try {
    const keyData = JSON.parse(atob(encryptedKey));
    
    // Decapsulate to get shared secret
    const sharedSecret = await mlkemDecapsulate(keyData.ciphertext, privateKey);
    
    // Use shared secret to decrypt the AES key
    const sharedSecretBytes = Uint8Array.from(sharedSecret.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const iv = Uint8Array.from(atob(keyData.iv), c => c.charCodeAt(0));
    const encryptedKeyBytes = Uint8Array.from(atob(keyData.encryptedKey), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      sharedSecretBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decryptedKey = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encryptedKeyBytes
    );
    
    console.log('🔓 Real ML-KEM-768 decryption performed');
    return new TextDecoder().decode(decryptedKey);
  } catch (error) {
    console.error('ML-KEM decryption failed:', error);
    throw new Error(`ML-KEM decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a real ML-KEM-768 key pair
 * @returns ML-KEM public and private key pair
 */
export async function generateKyberKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  try {
    console.log('🔑 Generating real ML-KEM-768 key pair...');
    const keyPair = await generateMLKEMKeyPair();
    console.log('✅ Real ML-KEM-768 key pair generated');
    return keyPair;
  } catch (error) {
    console.error('ML-KEM key generation failed:', error);
    throw new Error(`ML-KEM key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate ML-KEM public key format
 * @param publicKey - Base64 encoded public key
 * @returns True if valid format
 */
export function isValidKyberPublicKey(publicKey: string): boolean {
  try {
    const keyBytes = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0));
    // ML-KEM-768 public key is 1184 bytes
    return keyBytes.length === 1184;
  } catch {
    return false;
  }
}

/**
 * Get ML-KEM parameters
 */
export function getKyberParams() {
  return {
    algorithm: 'ML-KEM-768',
    quantumSafe: true,
    publicKeySize: 1184,
    privateKeySize: 2400,
    ciphertextSize: 1088,
    sharedSecretSize: 32
  };
}