
// src/utils/atomicDecryption.ts
// Helper function for decrypting atomic data using simple XOR (matching the Supabase function)

export function decryptWithKey(encryptedData: string, key: string): string {
  try {
    // Decode the base64 data
    const encrypted = atob(encryptedData);
    
    // Simple XOR decryption (matching the encryption in the Supabase function)
    let result = '';
    for (let i = 0; i < encrypted.length; i++) {
      result += String.fromCharCode(
        encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    return '[DECRYPTION_ERROR]';
  }
}
