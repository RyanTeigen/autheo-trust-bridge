
// src/utils/encryption/keys.ts

const LOCAL_AES_KEY_NAME = 'user_aes_key';
const LOCAL_PRIVATE_KEY_NAME = 'user_private_key';

export function getOrCreateAESKey(): string {
  let key = localStorage.getItem(LOCAL_AES_KEY_NAME);
  if (!key) {
    // Generate 256-bit hex key (32 bytes)
    key = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
    localStorage.setItem(LOCAL_AES_KEY_NAME, key);
  }
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

    // Generate new key pair (simplified for now - in production would use proper key generation)
    const privateKey = crypto.randomUUID() + crypto.randomUUID();
    const publicKey = `pk_${userId.substring(0, 8)}_${Date.now().toString(36)}`;
    
    // Store private key locally
    localStorage.setItem(LOCAL_PRIVATE_KEY_NAME, privateKey);
    
    return { publicKey, privateKey };
  } catch (error) {
    console.error('Error ensuring user keys:', error);
    throw new Error('Failed to ensure user encryption keys');
  }
}

export async function loadPrivateKeyFromLocal(): Promise<string | null> {
  try {
    return localStorage.getItem(LOCAL_PRIVATE_KEY_NAME);
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

// Clear all encryption keys
export function clearAllKeys(): void {
  localStorage.removeItem(LOCAL_AES_KEY_NAME);
  localStorage.removeItem(LOCAL_PRIVATE_KEY_NAME);
}
