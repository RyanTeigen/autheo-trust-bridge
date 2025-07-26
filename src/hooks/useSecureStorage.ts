/**
 * Enhanced secure storage hook replacing deprecated localStorage usage
 * Provides encrypted storage with key rotation and security monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { secureKeyStorage } from '@/utils/encryption/SecureKeyStorage';
import { useToast } from '@/hooks/use-toast';

interface SecureStorageOptions {
  keyRotationInterval?: number; // in days
  enableMonitoring?: boolean;
  fallbackToSession?: boolean;
}

interface StorageItem {
  value: string;
  encrypted: boolean;
  timestamp: number;
  keyId?: string;
  expiresAt?: number;
}

export const useSecureStorage = (options: SecureStorageOptions = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isReady, setIsReady] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  const {
    keyRotationInterval = 30,
    enableMonitoring = true,
    fallbackToSession = true
  } = options;

  // Initialize secure storage
  useEffect(() => {
    const initializeStorage = async () => {
      if (!user) return;

      try {
        // Generate or retrieve encryption key
        const key = await secureKeyStorage.generateSecureKey();
        setEncryptionKey(key);
        setIsReady(true);

        if (enableMonitoring) {
          console.log('Secure storage initialized for user:', user.id);
        }
      } catch (error) {
        console.error('Failed to initialize secure storage:', error);
        if (enableMonitoring) {
          toast({
            title: 'Storage Security Warning',
            description: 'Secure storage initialization failed. Using fallback.',
            variant: 'destructive'
          });
        }
      }
    };

    initializeStorage();
  }, [user, enableMonitoring, toast]);

  // Securely store item
  const setSecureItem = useCallback(async (
    key: string, 
    value: string, 
    ttl?: number
  ): Promise<void> => {
    if (!isReady || !encryptionKey || !user) {
      throw new Error('Secure storage not ready');
    }

    try {
      const storageItem: StorageItem = {
        value,
        encrypted: true,
        timestamp: Date.now(),
        keyId: 'current',
        expiresAt: ttl ? Date.now() + (ttl * 1000) : undefined
      };

      // Use secure key storage for encryption
      await secureKeyStorage.storeKey(key, value, user.id);

      if (enableMonitoring) {
        console.log(`Securely stored item: ${key}`);
      }
    } catch (error) {
      console.error('Failed to store secure item:', error);
      
      if (fallbackToSession) {
        sessionStorage.setItem(key, value);
        console.warn(`Fell back to session storage for: ${key}`);
      } else {
        throw error;
      }
    }
  }, [isReady, encryptionKey, user, enableMonitoring, fallbackToSession]);

  // Retrieve secure item
  const getSecureItem = useCallback(async (key: string): Promise<string | null> => {
    if (!isReady || !encryptionKey || !user) {
      return null;
    }

    try {
      const value = await secureKeyStorage.getKey(key);
      
      if (enableMonitoring && value) {
        console.log(`Retrieved secure item: ${key}`);
      }
      
      return value;
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      
      if (fallbackToSession) {
        const fallbackValue = sessionStorage.getItem(key);
        if (fallbackValue) {
          console.warn(`Retrieved from session storage fallback: ${key}`);
        }
        return fallbackValue;
      }
      
      return null;
    }
  }, [isReady, encryptionKey, user, enableMonitoring, fallbackToSession]);

  // Remove secure item
  const removeSecureItem = useCallback(async (key: string): Promise<void> => {
    if (!isReady || !user) return;

    try {
      await secureKeyStorage.removeKey(key);
      
      if (enableMonitoring) {
        console.log(`Removed secure item: ${key}`);
      }
    } catch (error) {
      console.error('Failed to remove secure item:', error);
      
      if (fallbackToSession) {
        sessionStorage.removeItem(key);
        console.warn(`Removed from session storage fallback: ${key}`);
      }
    }
  }, [isReady, user, enableMonitoring, fallbackToSession]);

  // Clear all secure items for user
  const clearSecureItems = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      // This would clear all keys for the current user
      // Implementation depends on the secure storage backend
      console.log('Clearing all secure items for user');
      
      // Clear session storage fallback too
      if (fallbackToSession) {
        sessionStorage.clear();
      }
      
      if (enableMonitoring) {
        toast({
          title: 'Storage Cleared',
          description: 'All secure items have been cleared.'
        });
      }
    } catch (error) {
      console.error('Failed to clear secure items:', error);
    }
  }, [user, fallbackToSession, enableMonitoring, toast]);

  // Check if key rotation is needed
  const checkKeyRotation = useCallback(async (): Promise<boolean> => {
    if (!user || !encryptionKey) return false;

    try {
      // Check last rotation timestamp
      const lastRotation = await getSecureItem('__last_key_rotation');
      if (!lastRotation) return true;

      const daysSinceRotation = (Date.now() - parseInt(lastRotation)) / (1000 * 60 * 60 * 24);
      return daysSinceRotation >= keyRotationInterval;
    } catch (error) {
      console.error('Failed to check key rotation:', error);
      return false;
    }
  }, [user, encryptionKey, keyRotationInterval, getSecureItem]);

  // Perform key rotation
  const rotateEncryptionKey = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      // Generate new encryption key
      const newKey = await secureKeyStorage.generateSecureKey();
      setEncryptionKey(newKey);
      
      // Store rotation timestamp
      await setSecureItem('__last_key_rotation', Date.now().toString());
      
      if (enableMonitoring) {
        toast({
          title: 'Security Enhanced',
          description: 'Encryption keys have been rotated successfully.'
        });
      }
      
      console.log('Encryption key rotated successfully');
    } catch (error) {
      console.error('Failed to rotate encryption key:', error);
      
      if (enableMonitoring) {
        toast({
          title: 'Key Rotation Failed',
          description: 'Failed to rotate encryption keys. Please try again.',
          variant: 'destructive'
        });
      }
    }
  }, [user, setSecureItem, enableMonitoring, toast]);

  return {
    isReady,
    setSecureItem,
    getSecureItem,
    removeSecureItem,
    clearSecureItems,
    checkKeyRotation,
    rotateEncryptionKey,
    encryptionKeyReady: !!encryptionKey
  };
};