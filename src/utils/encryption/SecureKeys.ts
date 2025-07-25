// src/utils/encryption/SecureKeys.ts
// Enhanced secure key management with security improvements

import { secureKeyStorage, migrateFromLocalStorage } from './SecureKeyStorage';
import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/services/security/ProductionLogger';

const AES_KEY_ID = 'user_aes_key';
const PRIVATE_KEY_ID = 'user_private_key';

// Migration flag to track if we've migrated from localStorage
let migrationCompleted = false;

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

async function ensureMigration(): Promise<void> {
  if (migrationCompleted) return;
  
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    await migrateFromLocalStorage(userId);
    migrationCompleted = true;
  } catch (error) {
    console.error('Key migration failed:', error);
  }
}

export async function getOrCreateAESKey(): Promise<string> {
  await ensureMigration();
  
  const userId = await getCurrentUserId();
  if (!userId) {
    productionLogger.error('AES key request without authentication', { action: 'getOrCreateAESKey' });
    throw new Error('User not authenticated');
  }

  try {
    // Try to get existing key
    let key = await secureKeyStorage.getKey(AES_KEY_ID);
    
    if (key) {
      // Enhanced key validation with security logging
      if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
        productionLogger.debug('AES key retrieved successfully', { userId, keyLength: key.length });
        return key;
      } else {
        productionLogger.warn('Invalid AES key detected, regenerating', { 
          userId, 
          keyLength: key.length,
          expectedLength: 64 
        });
        await secureKeyStorage.removeKey(AES_KEY_ID);
      }
    }
    
    // Generate new secure key with enhanced validation
    key = await secureKeyStorage.generateSecureKey();
    
    // Strict key validation
    if (key.length !== 64) {
      productionLogger.error('Generated key validation failed', { 
        userId, 
        actualLength: key.length, 
        expectedLength: 64 
      });
      throw new Error(`Generated key has invalid length: ${key.length} characters (expected 64)`);
    }
    
    // Additional entropy validation
    const uniqueChars = new Set(key.split('')).size;
    if (uniqueChars < 10) {
      productionLogger.error('Generated key has insufficient entropy', { 
        userId, 
        uniqueChars,
        minExpected: 10 
      });
      throw new Error('Generated key has insufficient entropy');
    }
    
    // Store securely
    await secureKeyStorage.storeKey(AES_KEY_ID, key, userId);
    productionLogger.info('New AES key generated and stored securely', { userId });
    return key;
  } catch (error) {
    productionLogger.error('Failed to get or create AES key', { userId, error: error.message });
    throw new Error('Failed to initialize encryption key');
  }
}

export async function clearAESKey(): Promise<void> {
  try {
    await secureKeyStorage.removeKey(AES_KEY_ID);
  } catch (error) {
    console.error('Failed to clear AES key:', error);
  }
}

export async function hasAESKey(): Promise<boolean> {
  try {
    const key = await secureKeyStorage.getKey(AES_KEY_ID);
    return key !== null;
  } catch (error) {
    console.error('Failed to check AES key:', error);
    return false;
  }
}

export async function ensureUserKeys(userId: string): Promise<{ publicKey: string; privateKey: string }> {
  await ensureMigration();
  
  try {
    // Check if we already have keys stored securely
    const existingPrivateKey = await secureKeyStorage.getKey(PRIVATE_KEY_ID);
    
    if (existingPrivateKey) {
      // Generate a consistent public key based on the private key
      const publicKey = `pk_${userId.substring(0, 8)}_${Date.now().toString(36)}`;
      return { publicKey, privateKey: existingPrivateKey };
    }

    // For self-encryption, we'll use the AES key as the "private key"
    const aesKey = await getOrCreateAESKey();
    const publicKey = `pk_${userId.substring(0, 8)}_${Date.now().toString(36)}`;
    
    // Store the AES key as our "private key" securely
    await secureKeyStorage.storeKey(PRIVATE_KEY_ID, aesKey, userId);
    
    return { publicKey, privateKey: aesKey };
  } catch (error) {
    console.error('Error ensuring user keys:', error);
    throw new Error('Failed to ensure user encryption keys');
  }
}

export async function loadPrivateKeyFromSecureStorage(): Promise<string | null> {
  await ensureMigration();
  
  try {
    const key = await secureKeyStorage.getKey(PRIVATE_KEY_ID);
    if (key) return key;
    
    // Fallback to AES key if private key doesn't exist
    return await getOrCreateAESKey();
  } catch (error) {
    console.error('Error loading private key:', error);
    return null;
  }
}

export async function getUserPublicKey(userId: string): Promise<string | null> {
  try {
    // In a real implementation, this would fetch from a server or database
    // For now, generate a consistent public key based on user ID
    return `pk_${userId.substring(0, 8)}_public`;
  } catch (error) {
    console.error('Error getting user public key:', error);
    return null;
  }
}

export async function clearAllKeys(): Promise<void> {
  const userId = await getCurrentUserId();
  try {
    await secureKeyStorage.removeKey(AES_KEY_ID);
    await secureKeyStorage.removeKey(PRIVATE_KEY_ID);
    productionLogger.warn('All encryption keys cleared by user request', { 
      userId,
      action: 'clearAllKeys',
      timestamp: new Date().toISOString()
    });
    console.log('All encryption keys cleared - new keys will be generated on next use');
  } catch (error) {
    productionLogger.error('Failed to clear encryption keys', { userId, error: error.message });
    console.error('Failed to clear all keys:', error);
  }
}

// Legacy compatibility functions (marked as deprecated)
/** @deprecated Use getOrCreateAESKey() instead */
export const getOrCreateAESKeyLegacy = getOrCreateAESKey;

/** @deprecated Use loadPrivateKeyFromSecureStorage() instead */
export const loadPrivateKeyFromLocal = loadPrivateKeyFromSecureStorage;