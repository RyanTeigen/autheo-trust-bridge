
import crypto from 'crypto';
import { mlkemEncapsulate, mlkemDecapsulate, isValidMLKEMPublicKey } from './pq-mlkem';

const AES_KEY_LENGTH = 32;

export interface HybridEncryptedData {
  encryptedData: string;
  pqEncryptedKey: string;
  iv: string;
  authTag: string;
  algorithm: string;
  timestamp: string;
}

export interface HybridDecryptionResult {
  data: string;
  metadata: {
    algorithm: string;
    timestamp: string;
    quantumSafe: boolean;
  };
}

export function generateSymmetricKey(): Buffer {
  return crypto.randomBytes(AES_KEY_LENGTH);
}

export function encryptWithAES(plaintext: string, key: Buffer) {
  const iv = crypto.randomBytes(12); // AES-GCM IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export function decryptWithAES(encryptedData: string, key: Buffer, ivHex: string, authTagHex: string): string {
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Hybrid encryption: AES-256-GCM for data + ML-KEM for key encapsulation
 */
export async function hybridEncrypt(plaintext: string, recipientPublicKey: string): Promise<HybridEncryptedData> {
  if (!recipientPublicKey || !isValidMLKEMPublicKey(recipientPublicKey)) {
    throw new Error('Invalid recipient public key for hybrid encryption');
  }

  try {
    // 1. Use ML-KEM to generate a shared secret (this replaces generating our own AES key)
    const { ciphertext, sharedSecret } = await mlkemEncapsulate(recipientPublicKey);
    
    // 2. Use the shared secret as our AES key (first 32 bytes)
    const aesKey = Buffer.from(sharedSecret.substring(0, 64), 'hex'); // 32 bytes = 64 hex chars
    
    // 3. Encrypt data with AES-256-GCM
    const { encryptedData, iv, authTag } = encryptWithAES(plaintext, aesKey);

    return {
      encryptedData,
      pqEncryptedKey: ciphertext, // This is the ML-KEM ciphertext
      iv,
      authTag,
      algorithm: 'AES-256-GCM + ML-KEM-768',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Hybrid encryption failed:', error);
    throw new Error(`Hybrid encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Hybrid decryption: ML-KEM for key decapsulation + AES-256-GCM for data
 */
export async function hybridDecrypt(encrypted: HybridEncryptedData, userPrivateKey: string): Promise<HybridDecryptionResult> {
  try {
    // 1. Decrypt the shared secret using ML-KEM
    const sharedSecret = await mlkemDecapsulate(encrypted.pqEncryptedKey, userPrivateKey);
    
    // 2. Use the shared secret as our AES key (first 32 bytes)
    const aesKey = Buffer.from(sharedSecret.substring(0, 64), 'hex'); // 32 bytes = 64 hex chars
    
    // 3. Decrypt data with AES-256-GCM
    const decryptedData = decryptWithAES(
      encrypted.encryptedData,
      aesKey,
      encrypted.iv,
      encrypted.authTag
    );

    return {
      data: decryptedData,
      metadata: {
        algorithm: encrypted.algorithm || 'AES-256-GCM + ML-KEM-768',
        timestamp: encrypted.timestamp || new Date().toISOString(),
        quantumSafe: true
      }
    };
  } catch (error) {
    console.error('Hybrid decryption failed:', error);
    throw new Error(`Hybrid decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate hybrid encrypted data structure
 */
export function validateHybridEncryptedData(encrypted: HybridEncryptedData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!encrypted.encryptedData) errors.push('Missing encrypted data');
  if (!encrypted.pqEncryptedKey) errors.push('Missing post-quantum encrypted key');
  if (!encrypted.iv) errors.push('Missing initialization vector');
  if (!encrypted.authTag) errors.push('Missing authentication tag');
  if (!encrypted.algorithm) errors.push('Missing algorithm specification');
  if (!encrypted.timestamp) errors.push('Missing timestamp');

  // Validate ML-KEM ciphertext format (should be base64)
  if (encrypted.pqEncryptedKey) {
    try {
      const ciphertext = Buffer.from(encrypted.pqEncryptedKey, 'base64');
      // ML-KEM-768 ciphertext is 1088 bytes
      if (ciphertext.length !== 1088) {
        errors.push('Invalid ML-KEM ciphertext size');
      }
    } catch {
      errors.push('Invalid ML-KEM ciphertext format');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Encrypt for multiple recipients using hybrid encryption
 */
export async function hybridEncryptForMultipleRecipients(
  plaintext: string, 
  recipientPublicKeys: string[]
): Promise<{ [publicKey: string]: HybridEncryptedData }> {
  const results: { [publicKey: string]: HybridEncryptedData } = {};
  
  // Process encryptions in parallel for better performance
  const encryptionPromises = recipientPublicKeys.map(async (publicKey) => {
    const encrypted = await hybridEncrypt(plaintext, publicKey);
    return { publicKey, encrypted };
  });

  const encryptionResults = await Promise.all(encryptionPromises);
  
  for (const { publicKey, encrypted } of encryptionResults) {
    results[publicKey] = encrypted;
  }
  
  return results;
}
