
// utils/encryption/record.ts

import { encryptText, decryptText } from './crypto';

// -- Simple encrypt for self-encryption using AES-GCM --
export async function encryptRecordForSelf(record: any, userKey: string): Promise<{ iv: string; ciphertext: string }> {
  const plaintext = JSON.stringify(record);
  const encrypted = await encryptText(plaintext, userKey);
  
  // Split the encrypted format "iv:ciphertext"
  const [iv, ciphertext] = encrypted.split(':');
  
  return {
    iv,
    ciphertext
  };
}

// -- Simple decrypt for self-decryption using AES-GCM --
export async function decryptRecordForSelf(
  encrypted: { iv: string; ciphertext: string }, 
  userKey: string
): Promise<any> {
  // Reconstruct the encrypted format "iv:ciphertext"
  const encryptedData = `${encrypted.iv}:${encrypted.ciphertext}`;
  const decrypted = await decryptText(encryptedData, userKey);
  
  return JSON.parse(decrypted);
}

// Legacy functions for compatibility (if needed later)
// -- Derive AES key from ECDH key --
async function deriveAESKey(privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> {
  const sharedSecret = await crypto.subtle.deriveBits(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    256
  );

  return await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

// -- Encrypt record using AES-GCM (legacy for CryptoKey pairs) --
export async function encryptRecord(
  record: any, 
  privateKey: CryptoKey, 
  publicKey: CryptoKey
): Promise<{ iv: string; ciphertext: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(record));

  const aesKey = await deriveAESKey(privateKey, publicKey);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, 
    aesKey, 
    encoded
  );

  return {
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
  };
}

// -- Decrypt record using AES-GCM (legacy for CryptoKey pairs) --
export async function decryptRecord(
  { iv, ciphertext }: { iv: string; ciphertext: string }, 
  privateKey: CryptoKey, 
  publicKey: CryptoKey
): Promise<any> {
  const aesKey = await deriveAESKey(privateKey, publicKey);

  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const dataBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes }, 
    aesKey, 
    dataBytes
  );
  
  return JSON.parse(new TextDecoder().decode(decrypted));
}
