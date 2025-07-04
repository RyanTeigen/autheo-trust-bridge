
// src/utils/encryption/crypto.ts

function hexToArrayBuffer(hex: string): ArrayBuffer {
  // Ensure hex string has even length and is valid
  if (hex.length % 2 !== 0) {
    throw new Error(`Invalid hex string length: ${hex.length}. Must be even.`);
  }
  
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const hexByte = hex.substring(i * 2, i * 2 + 2);
    const parsed = parseInt(hexByte, 16);
    if (isNaN(parsed)) {
      throw new Error(`Invalid hex character at position ${i * 2}: ${hexByte}`);
    }
    bytes[i] = parsed;
  }
  return bytes.buffer;
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function importKey(hexKey: string): Promise<CryptoKey> {
  const keyBuffer = hexToArrayBuffer(hexKey);
  
  // Validate key length (128 or 256 bits)
  const keyLengthBits = keyBuffer.byteLength * 8;
  if (keyLengthBits !== 128 && keyLengthBits !== 256) {
    throw new Error(`Invalid AES key length: ${keyLengthBits} bits. Must be 128 or 256 bits.`);
  }
  
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
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
