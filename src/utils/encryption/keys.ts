
// src/utils/encryption/keys.ts

const LOCAL_AES_KEY_NAME = 'user_aes_key';

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
