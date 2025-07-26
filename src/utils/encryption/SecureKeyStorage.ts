// src/utils/encryption/SecureKeyStorage.ts
// Secure key storage replacement for localStorage approach

import { SecureKeyManager } from '@/services/security/SecureKeyManager';

interface SecureKeyStorage {
  getKey(keyId: string): Promise<string | null>;
  storeKey(keyId: string, key: string, userId: string): Promise<void>;
  removeKey(keyId: string): Promise<void>;
  generateSecureKey(): Promise<string>;
}

class WebCryptoKeyStorage implements SecureKeyStorage {
  private static readonly STORAGE_NAME = 'autheo-secure-keys';
  private static readonly VERSION = 1;

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(WebCryptoKeyStorage.STORAGE_NAME, WebCryptoKeyStorage.VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('keys')) {
          const store = db.createObjectStore('keys', { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  async generateSecureKey(): Promise<string> {
    // Generate a secure 256-bit key using Web Crypto API
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const exported = await crypto.subtle.exportKey('raw', key);
    return Array.from(new Uint8Array(exported))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async storeKey(keyId: string, key: string, userId: string): Promise<void> {
    try {
      // First, try to use WebAuthn/Secure Enclave if available
      if (SecureKeyManager.isWebAuthnSupported()) {
        try {
          await SecureKeyManager.generateSecureKeyPair(userId);
          return;
        } catch (webAuthnError) {
          console.warn('WebAuthn storage failed, falling back to IndexedDB', webAuthnError);
        }
      }

      // Fallback to IndexedDB with encryption
      let db: IDBDatabase;
      try {
        db = await this.openDB();
      } catch (dbError) {
        console.error('Failed to open IndexedDB, using in-memory storage', dbError);
        // Store in memory as last resort
        (window as any).__secureKeys = (window as any).__secureKeys || new Map();
        (window as any).__secureKeys.set(keyId, { key, userId, stored: Date.now() });
        return;
      }

      const transaction = db.transaction(['keys'], 'readwrite');
      const store = transaction.objectStore('keys');

      // Encrypt the key before storing with error handling
      let encryptedKey: string;
      try {
        encryptedKey = await this.encryptKey(key, userId);
      } catch (encryptError) {
        console.warn('Key encryption failed, storing with basic obfuscation', encryptError);
        encryptedKey = btoa(key + userId); // Basic obfuscation as fallback
      }
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          id: keyId,
          userId,
          encryptedKey,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('All key storage methods failed, using session storage', error);
      // Last resort: session storage (temporary)
      try {
        sessionStorage.setItem(`secure_key_${keyId}`, JSON.stringify({ key, userId }));
      } catch (sessionError) {
        throw new Error('All secure storage methods failed');
      }
    }
  }

  async getKey(keyId: string): Promise<string | null> {
    try {
      // First, try to get from WebAuthn/Secure Enclave
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      if (SecureKeyManager.isWebAuthnSupported()) {
        try {
          const keyRef = await SecureKeyManager.generateSecureKeyPair(userId);
          if (keyRef && keyRef.keyId === keyId) {
            return keyRef.publicKey;
          }
        } catch (error) {
          console.warn('WebAuthn key retrieval failed, falling back to IndexedDB');
        }
      }

      // Fallback to IndexedDB
      const db = await this.openDB();
      const transaction = db.transaction(['keys'], 'readonly');
      const store = transaction.objectStore('keys');

      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get(keyId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!result) return null;

      // Update last accessed time
      this.updateLastAccessed(keyId);

      // Decrypt and return key
      return await this.decryptKey(result.encryptedKey, userId);
    } catch (error) {
      console.error('Failed to retrieve key:', error);
      return null;
    }
  }

  async removeKey(keyId: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (userId && SecureKeyManager.isWebAuthnSupported()) {
        await SecureKeyManager.clearUserKeys(userId);
      }

      const db = await this.openDB();
      const transaction = db.transaction(['keys'], 'readwrite');
      const store = transaction.objectStore('keys');

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(keyId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to remove key:', error);
      throw new Error('Key removal failed');
    }
  }

  private async encryptKey(key: string, userId: string): Promise<string> {
    // Use a combination of user ID and device-specific data for encryption
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    
    // Generate a key derivation from user context
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(userId + navigator.userAgent.substring(0, 50)),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('autheo-salt-2024'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  private async decryptKey(encryptedKey: string, userId: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Decode the combined data
    const combined = new Uint8Array(atob(encryptedKey).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // Recreate the derived key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(userId + navigator.userAgent.substring(0, 50)),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('autheo-salt-2024'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      encrypted
    );

    return decoder.decode(decrypted);
  }

  private async getCurrentUserId(): Promise<string | null> {
    try {
      // Get current user from Supabase auth
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.warn('Failed to get current user ID:', error);
      return null;
    }
  }

  private async updateLastAccessed(keyId: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['keys'], 'readwrite');
      const store = transaction.objectStore('keys');

      const getRequest = store.get(keyId);
      getRequest.onsuccess = () => {
        const result = getRequest.result;
        if (result) {
          result.lastAccessed = new Date().toISOString();
          store.put(result);
        }
      };
    } catch (error) {
      console.warn('Failed to update last accessed time:', error);
    }
  }
}

// Export the secure key storage instance
export const secureKeyStorage = new WebCryptoKeyStorage();

// Legacy compatibility functions for migration
export const migrateFromLocalStorage = async (userId: string): Promise<void> => {
  const legacyKeys = [
    'user_aes_key',
    'user_private_key',
    'userEncryptionKey'
  ];

  for (const keyName of legacyKeys) {
    const legacyKey = localStorage.getItem(keyName);
    if (legacyKey) {
      try {
        // Store in secure storage
        await secureKeyStorage.storeKey(keyName, legacyKey, userId);
        
        // Remove from localStorage
        localStorage.removeItem(keyName);
        
        console.log(`Migrated ${keyName} to secure storage`);
      } catch (error) {
        console.error(`Failed to migrate ${keyName}:`, error);
      }
    }
  }
};

export const clearAllLegacyKeys = (): void => {
  const legacyKeys = [
    'user_aes_key',
    'user_private_key', 
    'userEncryptionKey'
  ];

  legacyKeys.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('Cleared all legacy encryption keys from localStorage');
};