
/**
 * Production Post-Quantum Cryptography using ML-KEM (mlkem library)
 * This replaces the mock implementation with real quantum-safe cryptography
 */

import { MlKem768 } from 'mlkem';

export interface MLKEMKeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Generate a ML-KEM-768 key pair for quantum-safe encryption
 */
export async function generateMLKEMKeyPair(): Promise<MLKEMKeyPair> {
  try {
    const kem = new MlKem768();
    const [publicKey, privateKey] = await kem.generateKeyPair();
    
    return {
      publicKey: Buffer.from(publicKey).toString('base64'),
      privateKey: Buffer.from(privateKey).toString('base64')
    };
  } catch (error) {
    console.error('ML-KEM key generation failed:', error);
    throw new Error(`ML-KEM key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt (encapsulate) a shared secret using ML-KEM public key
 * @param publicKeyB64 - Base64 encoded ML-KEM public key
 * @returns Base64 encoded ciphertext and shared secret
 */
export async function mlkemEncapsulate(publicKeyB64: string): Promise<{ ciphertext: string; sharedSecret: string }> {
  try {
    const kem = new MlKem768();
    const publicKey = Uint8Array.from(Buffer.from(publicKeyB64, 'base64'));
    
    const [ciphertext, sharedSecret] = await kem.encap(publicKey);
    
    return {
      ciphertext: Buffer.from(ciphertext).toString('base64'),
      sharedSecret: Buffer.from(sharedSecret).toString('hex')
    };
  } catch (error) {
    console.error('ML-KEM encapsulation failed:', error);
    throw new Error(`ML-KEM encapsulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt (decapsulate) the shared secret using ML-KEM private key
 * @param ciphertextB64 - Base64 encoded ciphertext
 * @param privateKeyB64 - Base64 encoded ML-KEM private key
 * @returns Hex encoded shared secret
 */
export async function mlkemDecapsulate(ciphertextB64: string, privateKeyB64: string): Promise<string> {
  try {
    const kem = new MlKem768();
    const privateKey = Uint8Array.from(Buffer.from(privateKeyB64, 'base64'));
    const ciphertext = Uint8Array.from(Buffer.from(ciphertextB64, 'base64'));
    
    const sharedSecret = await kem.decap(ciphertext, privateKey);
    
    return Buffer.from(sharedSecret).toString('hex');
  } catch (error) {
    console.error('ML-KEM decapsulation failed:', error);
    throw new Error(`ML-KEM decapsulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate ML-KEM public key format
 */
export function isValidMLKEMPublicKey(publicKey: string): boolean {
  try {
    const keyBytes = Buffer.from(publicKey, 'base64');
    // ML-KEM-768 public key is 1184 bytes
    return keyBytes.length === 1184;
  } catch {
    return false;
  }
}

/**
 * Validate ML-KEM private key format
 */
export function isValidMLKEMPrivateKey(privateKey: string): boolean {
  try {
    const keyBytes = Buffer.from(privateKey, 'base64');
    // ML-KEM-768 private key is 2400 bytes
    return keyBytes.length === 2400;
  } catch {
    return false;
  }
}

/**
 * Get ML-KEM parameters for information
 */
export function getMLKEMParams() {
  return {
    algorithm: 'ML-KEM-768',
    quantumSafe: true,
    implementation: 'mlkem',
    publicKeySize: 1184,
    privateKeySize: 2400,
    ciphertextSize: 1088,
    sharedSecretSize: 32
  };
}
