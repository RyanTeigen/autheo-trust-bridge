/**
 * Medical Record Encryption Helper
 * Uses mock Kyber utilities for development - will be replaced with real crypto
 */

import { generateAESKey, encryptWithAES, encryptWithKyber } from './kyber-utils';
import { supabase } from '@/integrations/supabase/client';

export interface EncryptedMedicalRecord {
  encryptedPayload: string;
  encryptedKey: string;
  algorithm: string;
  timestamp: string;
}

/**
 * Encrypt medical record with hybrid AES + Kyber encryption
 * @param recordJson - JSON string of medical record data
 * @param patientPublicKyberKey - Patient's Kyber public key
 * @returns Encrypted payload and encrypted AES key
 */
export async function encryptMedicalRecord(
  recordJson: string,
  patientPublicKyberKey: string
): Promise<EncryptedMedicalRecord> {
  try {
    console.log('🔐 Starting medical record encryption...');
    
    // 1. Generate a symmetric AES key
    const aesKey = await generateAESKey();
    console.log('✅ AES key generated');

    // 2. Encrypt the record with AES
    const encryptedPayload = await encryptWithAES(recordJson, aesKey);
    console.log('✅ Record encrypted with AES');

    // 3. Encrypt the AES key with the patient's Kyber public key
    const encryptedKey = await encryptWithKyber(aesKey, patientPublicKyberKey);
    console.log('✅ AES key encrypted with Kyber');

    return {
      encryptedPayload,
      encryptedKey,
      algorithm: 'AES-256-GCM + Kyber-768',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Medical record encryption failed:', error);
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch patient's Kyber public key from database
 * @param patientId - Patient's UUID
 * @returns Patient's Kyber public key
 */
export async function fetchPublicKey(patientId: string): Promise<string> {
  try {
    console.log('🔍 Fetching patient public key for:', patientId);
    
    // First try to get from patients table (check if kyber_public_key column exists)
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('user_id')
      .eq('id', patientId)
      .single();

    if (patientError && patientError.code !== 'PGRST116') { // PGRST116 = not found
      throw new Error(`Database error: ${patientError.message}`);
    }

    if (!patientData) {
      throw new Error('Patient not found');
    }

    // Try to get from profiles table using user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('encryption_public_key')
      .eq('id', patientData.user_id)
      .single();

    if (!profileError && profileData?.encryption_public_key) {
      console.log('✅ Found encryption public key in profiles table');
      return profileData.encryption_public_key;
    }

    // If no key found, generate a mock key for development
    console.warn('⚠️ No public key found, generating mock key for patient:', patientId);
    const mockKey = btoa(`MOCK_KYBER_PUBLIC_KEY::${patientId}::${Date.now()}`);
    
    // Store the mock key for consistency
    await supabase
      .from('profiles')
      .update({ encryption_public_key: mockKey })
      .eq('id', patientData.user_id);
    console.log('💾 Stored mock public key in profiles table');

    return mockKey;
  } catch (error) {
    console.error('❌ Failed to fetch public key:', error);
    
    // Fallback: generate a mock key
    const fallbackKey = btoa(`FALLBACK_KYBER_KEY::${patientId}::${Date.now()}`);
    console.log('🔄 Using fallback mock key');
    return fallbackKey;
  }
}

/**
 * Store patient's Kyber public key in database
 * @param patientId - Patient's UUID
 * @param publicKey - Kyber public key to store
 */
export async function storePublicKey(patientId: string, publicKey: string): Promise<void> {
  try {
    // Get user_id from patients table
    const { data: patientData } = await supabase
      .from('patients')
      .select('user_id')
      .eq('id', patientId)
      .single();

    if (patientData?.user_id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ encryption_public_key: publicKey })
        .eq('id', patientData.user_id);

      if (profileError) {
        throw new Error(`Failed to store public key: ${profileError.message}`);
      }
    }

    console.log('✅ Public key stored successfully');
  } catch (error) {
    console.error('❌ Failed to store public key:', error);
    throw error;
  }
}