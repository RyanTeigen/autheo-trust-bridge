
/**
 * Utility for decrypting atomic data values
 */
export const decryptWithKey = (encryptedData: string, key: string): string => {
  try {
    const decoded = atob(encryptedData);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    return 'Unable to decrypt';
  }
};
