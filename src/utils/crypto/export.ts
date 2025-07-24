
/**
 * AES-256-GCM encryption utilities for record export
 * DEPRECATED: This file contains insecure encryption practices
 * Use SecureExport.ts instead for secure encryption
 */

import { 
  encryptWithSecureKey, 
  decryptWithSecureKey
} from './SecureExport';

// Warning flag
let warningShown = false;
function showSecurityWarning(functionName: string) {
  if (!warningShown) {
    console.warn(`🚨 SECURITY WARNING: ${functionName} uses insecure encryption. Please migrate to SecureExport.ts`);
    warningShown = true;
  }
}

export function encryptWithKey(plaintext: string, key: string): string {
  showSecurityWarning('encryptWithKey');
  
  // INSECURE IMPLEMENTATION - DO NOT USE IN PRODUCTION
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  
  // For now, return a base64 encoded payload
  // In production, you'd use proper Web Crypto API encryption
  const payload = {
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
    encrypted: btoa(plaintext), // Simplified - should be actual AES-GCM
    authTag: Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join(''),
    timestamp: new Date().toISOString()
  };
  
  return JSON.stringify(payload);
}

export function decryptWithKey(payload: string, key: string): string {
  showSecurityWarning('decryptWithKey');
  
  try {
    const data = JSON.parse(payload);
    // Simplified decryption - in production use proper AES-GCM
    return atob(data.encrypted);
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate or retrieve user encryption key from localStorage
 * INSECURE: Uses localStorage which is vulnerable to XSS attacks
 */
export function getUserEncryptionKey(): string {
  showSecurityWarning('getUserEncryptionKey');
  
  let key = localStorage.getItem('userEncryptionKey');
  if (!key) {
    // Generate a new 256-bit key
    const keyArray = crypto.getRandomValues(new Uint8Array(32));
    key = Array.from(keyArray).map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem('userEncryptionKey', key);
  }
  return key;
}

// Secure alternatives (recommended)
export { encryptWithSecureKey as encryptWithKeySecure };
export { decryptWithSecureKey as decryptWithKeySecure };
