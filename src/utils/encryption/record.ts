
// utils/encryption/record.ts

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

// -- Encrypt record using AES-GCM --
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

// -- Decrypt record using AES-GCM --
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

// -- Simple encrypt for self-encryption (same key for both) --
export async function encryptRecordForSelf(record: any, userKey: CryptoKey): Promise<{ iv: string; ciphertext: string }> {
  return await encryptRecord(record, userKey, userKey);
}

// -- Simple decrypt for self-decryption (same key for both) --
export async function decryptRecordForSelf(
  encrypted: { iv: string; ciphertext: string }, 
  userKey: CryptoKey
): Promise<any> {
  return await decryptRecord(encrypted, userKey, userKey);
}
