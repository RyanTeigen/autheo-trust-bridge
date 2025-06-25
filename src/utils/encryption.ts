import crypto from 'crypto';
import { hybridEncrypt, hybridDecrypt, HybridEncryptedData, HybridDecryptionResult, validateHybridEncryptedData } from './hybrid-encryption';
import { isValidKyberPublicKey, getKyberParams } from './pq-kyber';

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
 * Encrypt a medical record using hybrid encryption (AES-256-GCM + Kyber KEM)
 */
export async function encryptRecord(plaintext: string, recipientPublicKey: string): Promise<EncryptedRecord> {
  if (!recipientPublicKey || !isValidKyberPublicKey(recipientPublicKey)) {
    throw new Error('Invalid recipient public key for quantum-safe encryption');
  }

  try {
    // Use hybrid encryption
    const hybridResult = await hybridEncrypt(plaintext, recipientPublicKey);
    
    // Get Kyber parameters for metadata
    const kyberParams = getKyberParams();

    return {
      encryptedData: hybridResult.encryptedData,
      pqEncryptedKey: hybridResult.pqEncryptedKey,
      iv: hybridResult.iv,
      authTag: hybridResult.authTag,
      algorithm: hybridResult.algorithm,
      timestamp: hybridResult.timestamp,
      kyberParams
    };
  } catch (error) {
    console.error('Quantum-safe encryption failed:', error);
    throw new Error(`Quantum-safe encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt a medical record using hybrid decryption (Kyber KEM + AES-256-GCM)
 */
export async function decryptRecord(encrypted: EncryptedRecord, userPrivateKey: string): Promise<DecryptionResult> {
  try {
    // Convert to hybrid format and decrypt
    const hybridEncrypted: HybridEncryptedData = {
      encryptedData: encrypted.encryptedData,
      pqEncryptedKey: encrypted.pqEncryptedKey,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      algorithm: encrypted.algorithm,
      timestamp: encrypted.timestamp
    };

    const hybridResult = await hybridDecrypt(hybridEncrypted, userPrivateKey);

    return {
      data: hybridResult.data,
      metadata: {
        algorithm: hybridResult.metadata.algorithm,
        timestamp: hybridResult.metadata.timestamp,
        quantumSafe: hybridResult.metadata.quantumSafe,
        kyberParams: encrypted.kyberParams
      }
    };
  } catch (error) {
    console.error('Quantum-safe decryption failed:', error);
    throw new Error(`Quantum-safe decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt data for multiple recipients using hybrid post-quantum cryptography
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
  const hybridData: HybridEncryptedData = {
    encryptedData: encrypted.encryptedData,
    pqEncryptedKey: encrypted.pqEncryptedKey,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
    algorithm: encrypted.algorithm,
    timestamp: encrypted.timestamp
  };

  return validateHybridEncryptedData(hybridData);
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
