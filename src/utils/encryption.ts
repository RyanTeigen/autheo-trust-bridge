import crypto from 'crypto';
import { kyberEncrypt, kyberDecrypt, isValidKyberPublicKey, getKyberParams } from './pq-kyber';

const AES_KEY_LENGTH = 32;
const AES_IV_LENGTH = 12; // GCM recommended IV size

export interface EncryptedRecord {
  encryptedData: string;
  pqEncryptedKey: string;
  iv: string;
  authTag: string;
  algorithm: string;
  timestamp: string;
  kyberParams?: any; // Optional Kyber parameters for verification
}

export interface DecryptionResult {
  data: string;
  metadata: {
    algorithm: string;
    timestamp: string;
    quantumSafe: boolean;
    kyberParams?: any;
  };
}

/**
 * Encrypt a medical record using quantum-safe hybrid encryption
 * Combines AES-256-GCM for data encryption with real Kyber for key encapsulation
 */
export async function encryptRecord(plaintext: string, recipientPublicKey: string): Promise<EncryptedRecord> {
  if (!recipientPublicKey || !isValidKyberPublicKey(recipientPublicKey)) {
    throw new Error('Invalid recipient public key for quantum-safe encryption');
  }

  try {
    // Generate random AES key and IV
    const aesKey = crypto.randomBytes(AES_KEY_LENGTH);
    const iv = crypto.randomBytes(AES_IV_LENGTH);

    // Encrypt data with AES-256-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Encrypt AES key with real Kyber post-quantum cryptography
    const pqEncryptedKey = await kyberEncrypt(aesKey.toString('hex'), recipientPublicKey);

    // Get Kyber parameters for metadata
    const kyberParams = getKyberParams();

    return {
      encryptedData: encrypted,
      pqEncryptedKey,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: 'AES-256-GCM + Kyber-1024',
      timestamp: new Date().toISOString(),
      kyberParams
    };
  } catch (error) {
    console.error('Quantum-safe encryption failed:', error);
    throw new Error(`Quantum-safe encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt a medical record using quantum-safe hybrid decryption
 */
export async function decryptRecord(encrypted: EncryptedRecord, userPrivateKey: string): Promise<DecryptionResult> {
  try {
    // Decrypt AES key using real Kyber
    const aesKeyHex = await kyberDecrypt(encrypted.pqEncryptedKey, userPrivateKey);
    const aesKey = Buffer.from(aesKeyHex, 'hex');
    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');

    // Decrypt data with AES-256-GCM
    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return {
      data: decrypted,
      metadata: {
        algorithm: encrypted.algorithm || 'AES-256-GCM + Kyber-1024',
        timestamp: encrypted.timestamp || new Date().toISOString(),
        quantumSafe: true,
        kyberParams: encrypted.kyberParams
      }
    };
  } catch (error) {
    console.error('Quantum-safe decryption failed:', error);
    throw new Error(`Quantum-safe decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt data for multiple recipients using real post-quantum cryptography
 */
export async function encryptForMultipleRecipients(
  plaintext: string, 
  recipientPublicKeys: string[]
): Promise<{ [publicKey: string]: EncryptedRecord }> {
  const results: { [publicKey: string]: EncryptedRecord } = {};
  
  // Process encryptions in parallel for better performance
  const encryptionPromises = recipientPublicKeys.map(async (publicKey) => {
    const encrypted = await encryptRecord(plaintext, publicKey);
    return { publicKey, encrypted };
  });

  const encryptionResults = await Promise.all(encryptionPromises);
  
  for (const { publicKey, encrypted } of encryptionResults) {
    results[publicKey] = encrypted;
  }
  
  return results;
}

/**
 * Validate encrypted record integrity
 */
export function validateEncryptedRecord(encrypted: EncryptedRecord): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!encrypted.encryptedData) errors.push('Missing encrypted data');
  if (!encrypted.pqEncryptedKey) errors.push('Missing post-quantum encrypted key');
  if (!encrypted.iv) errors.push('Missing initialization vector');
  if (!encrypted.authTag) errors.push('Missing authentication tag');
  if (!encrypted.algorithm) errors.push('Missing algorithm specification');
  if (!encrypted.timestamp) errors.push('Missing timestamp');

  // Validate Kyber encrypted key format
  if (encrypted.pqEncryptedKey && !encrypted.pqEncryptedKey.startsWith('kyber_enc_')) {
    errors.push('Invalid post-quantum encrypted key format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Legacy encryption for backward compatibility (to be phased out)
 */
export function encryptLegacy(text: string): string {
  const ENCRYPTION_KEY = 'medical-records-key-2024';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return btoa(result);
}

/**
 * Legacy decryption for backward compatibility (to be phased out)
 */
export function decryptLegacy(encryptedText: string): string {
  try {
    const ENCRYPTION_KEY = 'medical-records-key-2024';
    const decoded = atob(encryptedText);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return result;
  } catch (error) {
    console.error('Legacy decryption error:', error);
    return '';
  }
}
