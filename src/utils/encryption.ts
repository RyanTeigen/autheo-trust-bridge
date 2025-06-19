
import crypto from 'crypto';
import { kyberEncrypt, kyberDecrypt, isValidKyberPublicKey } from './pq-kyber';

const AES_KEY_LENGTH = 32;

export interface EncryptedRecord {
  encryptedData: string;
  pqEncryptedKey: string;
  iv: string;
  authTag: string;
  algorithm: string;
  timestamp: string;
}

export interface DecryptionResult {
  data: string;
  metadata: {
    algorithm: string;
    timestamp: string;
    quantumSafe: boolean;
  };
}

/**
 * Encrypt a medical record using quantum-safe hybrid encryption
 * Combines AES-256-GCM for data encryption with Kyber for key encapsulation
 */
export async function encryptRecord(plaintext: string, recipientPublicKey: string): Promise<EncryptedRecord> {
  if (!recipientPublicKey || !isValidKyberPublicKey(recipientPublicKey)) {
    throw new Error('Invalid recipient public key for quantum-safe encryption');
  }

  // Generate random AES key and IV
  const aesKey = crypto.randomBytes(AES_KEY_LENGTH);
  const iv = crypto.randomBytes(12); // AES-GCM recommended IV size

  // Encrypt data with AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  // Encrypt AES key with Kyber (post-quantum safe)
  const pqEncryptedKey = await kyberEncrypt(aesKey.toString('hex'), recipientPublicKey);

  return {
    encryptedData: encrypted,
    pqEncryptedKey,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    algorithm: 'AES-256-GCM + Kyber-1024',
    timestamp: new Date().toISOString()
  };
}

/**
 * Decrypt a medical record using quantum-safe hybrid decryption
 */
export async function decryptRecord(encrypted: EncryptedRecord, userPrivateKey: string): Promise<DecryptionResult> {
  try {
    // Decrypt AES key using Kyber
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
        quantumSafe: true
      }
    };
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt data for multiple recipients (useful for shared records)
 */
export async function encryptForMultipleRecipients(
  plaintext: string, 
  recipientPublicKeys: string[]
): Promise<{ [publicKey: string]: EncryptedRecord }> {
  const results: { [publicKey: string]: EncryptedRecord } = {};
  
  for (const publicKey of recipientPublicKeys) {
    results[publicKey] = await encryptRecord(plaintext, publicKey);
  }
  
  return results;
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
