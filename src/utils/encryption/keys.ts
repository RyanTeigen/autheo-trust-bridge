
// src/utils/encryption/keys.ts

const LOCAL_AES_KEY_NAME = 'user_aes_key';
const LOCAL_PRIVATE_KEY_NAME = 'user_private_key';

export function getOrCreateAESKey(): string {
  let key = localStorage.getItem(LOCAL_AES_KEY_NAME);
  
  // Validate existing key or generate new one
  if (key) {
    // Check if key is valid (should be 64 hex characters for 256-bit key)
    if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
      return key;
    } else {
      console.warn(`Invalid AES key found (${key.length * 4} bits), generating new one`);
      localStorage.removeItem(LOCAL_AES_KEY_NAME);
    }
  }
  
  // Generate new 256-bit key (32 bytes = 64 hex characters)
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  key = Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Validate the generated key
  if (key.length !== 64) {
    throw new Error(`Generated key has invalid length: ${key.length} characters (expected 64)`);
  }
  
  localStorage.setItem(LOCAL_AES_KEY_NAME, key);
  return key;
}

export function clearAESKey(): void {
  localStorage.removeItem(LOCAL_AES_KEY_NAME);
}

export function hasAESKey(): boolean {
  return localStorage.getItem(LOCAL_AES_KEY_NAME) !== null;
}

// User-specific encryption functions
export async function ensureUserKeys(userId: string): Promise<{ publicKey: string; privateKey: string }> {
  try {
    // Check if we already have keys stored locally
    const existingPrivateKey = localStorage.getItem(LOCAL_PRIVATE_KEY_NAME);
    
    if (existingPrivateKey) {
      // For now, generate a mock public key based on the private key
      const publicKey = `pk_${userId.substring(0, 8)}_${Date.now().toString(36)}`;
      return { publicKey, privateKey: existingPrivateKey };
    }

    // For self-encryption, we'll use the AES key as the "private key"
    const aesKey = getOrCreateAESKey();
    const publicKey = `pk_${userId.substring(0, 8)}_${Date.now().toString(36)}`;
    
    // Store the AES key as our "private key" for now
    localStorage.setItem(LOCAL_PRIVATE_KEY_NAME, aesKey);
    
    return { publicKey, privateKey: aesKey };
  } catch (error) {
    console.error('Error ensuring user keys:', error);
    throw new Error('Failed to ensure user encryption keys');
  }
}

export async function loadPrivateKeyFromLocal(): Promise<string | null> {
  try {
    return localStorage.getItem(LOCAL_PRIVATE_KEY_NAME) || getOrCreateAESKey();
  } catch (error) {
    console.error('Error loading private key from local storage:', error);
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

// Clear all encryption keys and force regeneration
export function clearAllKeys(): void {
  localStorage.removeItem(LOCAL_AES_KEY_NAME);
  localStorage.removeItem(LOCAL_PRIVATE_KEY_NAME);
  console.log('All encryption keys cleared - new keys will be generated on next use');
}
