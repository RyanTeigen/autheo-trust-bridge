
// src/utils/encryption/crypto.ts

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function importKey(hexKey: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    hexToArrayBuffer(hexKey),
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(plaintext: string, hexKey: string): Promise<string> {
  const key = await importKey(hexKey);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  const ivHex = arrayBufferToHex(iv.buffer);
  const dataHex = arrayBufferToHex(encrypted);
  return `${ivHex}:${dataHex}`;
}

export async function decryptText(encrypted: string, hexKey: string): Promise<string> {
  const [ivHex, dataHex] = encrypted.split(':');
  const iv = hexToArrayBuffer(ivHex);
  const data = hexToArrayBuffer(dataHex);
  const key = await importKey(hexKey);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}
