
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from '@/utils/environment';
import { mlkemDecapsulate } from '@/utils/pq-mlkem';
import { decryptWithAES } from '@/utils/hybrid-encryption';

export const useAuthenticatedFetch = () => {
  return useCallback(async (endpoint: string, options: RequestInit = {}) => {
    // If endpoint starts with http(s), use it as-is, otherwise prepend API_BASE_URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  }, []);
};

/**
 * Decrypt a quantum-safe medical record using stored private key
 */
export const decryptRecord = async (encryptedRecord: any): Promise<string> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get private key from localStorage
    const privateKeyB64 = localStorage.getItem(`mlkem_private_key_${user.id}`);
    if (!privateKeyB64) {
      throw new Error('Private key not found - please re-register for quantum-safe encryption');
    }

    // Parse the encrypted record data
    const encryptedData = typeof encryptedRecord.encrypted_data === 'string' 
      ? JSON.parse(encryptedRecord.encrypted_data)
      : encryptedRecord.encrypted_data;

    // Check if this is a quantum-safe encrypted record
    if (!encryptedData.pqEncryptedKey || !encryptedData.algorithm) {
      throw new Error('Record is not quantum-safe encrypted');
    }

    // Decrypt the AES key using ML-KEM
    const sharedSecretHex = await mlkemDecapsulate(encryptedData.pqEncryptedKey, privateKeyB64);
    
    // Use the first 32 bytes of shared secret as AES key
    const aesKey = Buffer.from(sharedSecretHex.substring(0, 64), 'hex');

    // Decrypt the record data using AES
    const plaintext = decryptWithAES(
      encryptedData.encryptedData,
      aesKey,
      encryptedData.iv,
      encryptedData.authTag
    );

    return plaintext;
  } catch (error) {
    console.error('Record decryption failed:', error);
    throw new Error(`Failed to decrypt record: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
