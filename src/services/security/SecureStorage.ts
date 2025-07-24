// Secure storage service to replace localStorage usage for sensitive data

import { secureKeyStorage } from '@/utils/encryption/SecureKeyStorage';

export interface StorageItem {
  value: string;
  encrypted: boolean;
  timestamp: number;
  expiresAt?: number;
}

export class SecureStorage {
  private static instance: SecureStorage;
  
  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  // Store sensitive data securely
  public async setSecureItem(key: string, value: string, ttl?: number): Promise<void> {
    try {
      const item: StorageItem = {
        value,
        encrypted: true,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : undefined
      };

      await secureKeyStorage.storeKey(key, JSON.stringify(item), 'secure');
    } catch (error) {
      throw new Error(`Failed to store secure item: ${error}`);
    }
  }

  // Get sensitive data securely
  public async getSecureItem(key: string): Promise<string | null> {
    try {
      const rawData = await secureKeyStorage.getKey(key);
      if (!rawData) return null;

      const item: StorageItem = JSON.parse(rawData);
      
      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await this.removeSecureItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.warn(`Failed to retrieve secure item: ${error}`);
      return null;
    }
  }

  // Remove sensitive data
  public async removeSecureItem(key: string): Promise<void> {
    try {
      await secureKeyStorage.removeKey(key);
    } catch (error) {
      console.warn(`Failed to remove secure item: ${error}`);
    }
  }

  // Store non-sensitive data (can use sessionStorage)
  public setSessionItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to store session item: ${error}`);
    }
  }

  // Get non-sensitive data from sessionStorage
  public getSessionItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to retrieve session item: ${error}`);
      return null;
    }
  }

  // Remove from sessionStorage
  public removeSessionItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove session item: ${error}`);
    }
  }

  // Migrate existing localStorage data to secure storage
  public async migrateFromLocalStorage(): Promise<void> {
    const sensitiveKeys = [
      'encryptionKey',
      'privateKey',
      'publicKey',
      'authToken',
      'refreshToken',
      'sessionToken',
      'userCredentials',
      'medicalData',
      'lastActivity'
    ];

    for (const key of sensitiveKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          await this.setSecureItem(key, value);
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to migrate ${key}:`, error);
        }
      }
    }
  }

  // Clear all sensitive data
  public async clearAllSecure(): Promise<void> {
    try {
      // Clear known sensitive keys
      const sensitiveKeys = [
        'encryptionKey', 'privateKey', 'publicKey', 'authToken', 
        'refreshToken', 'sessionToken', 'userCredentials', 'medicalData', 'lastActivity'
      ];
      
      for (const key of sensitiveKeys) {
        await secureKeyStorage.removeKey(key);
      }
    } catch (error) {
      console.warn('Failed to clear secure storage:', error);
    }
  }

  // Warn about localStorage usage
  public static warnAboutLocalStorageUsage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const originalSetItem = localStorage.setItem;
      
      localStorage.setItem = function(key: string, value: string) {
        console.warn(`⚠️ SECURITY WARNING: Using localStorage for "${key}". Consider using SecureStorage for sensitive data.`);
        return originalSetItem.call(this, key, value);
      };
    }
  }
}

// Export singleton instance
export const secureStorage = SecureStorage.getInstance();

// Initialize localStorage warnings in development
if (import.meta.env.DEV) {
  SecureStorage.warnAboutLocalStorageUsage();
}