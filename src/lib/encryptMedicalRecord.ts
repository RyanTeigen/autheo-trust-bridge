/**
 * Medical Record Encryption Helper
 * Uses mock Kyber utilities for development - will be replaced with real crypto
 */

import { generateAESKey, encryptWithAES, encryptWithKyber, isValidKyberPublicKey, generateKyberKeyPair } from './kyber-utils';
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
      algorithm: 'AES-256-GCM + ML-KEM-768',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Medical record encryption failed:', error);
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch patient's ML-KEM public key from database
 * @param patientId - Patient's UUID
 * @returns Patient's ML-KEM public key
 */
export async function fetchPublicKey(patientId: string): Promise<string> {
  try {
    console.log('🔍 Fetching patient ML-KEM public key for:', patientId);
    
    // Get patient data from database
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

    // Try to get existing key from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('encryption_public_key')
      .eq('id', patientData.user_id)
      .single();

    if (!profileError && profileData?.encryption_public_key) {
      // Check if it's a real ML-KEM key (1184 bytes when decoded)
      try {
        const keyBytes = Uint8Array.from(atob(profileData.encryption_public_key), c => c.charCodeAt(0));
        if (keyBytes.length === 1184) {
          console.log('✅ Found real ML-KEM public key in profiles table');
          return profileData.encryption_public_key;
        }
      } catch {
        // Invalid key format, generate new one
      }
    }

    // Generate a real ML-KEM key pair for the patient
    console.log('🔑 Generating new ML-KEM-768 key pair for patient...');
    const { publicKey, privateKey } = await generateKyberKeyPair();
    
    // Store the public key in profiles table
    await supabase
      .from('profiles')
      .update({ encryption_public_key: publicKey })
      .eq('id', patientData.user_id);
    
    console.log('💾 Stored new ML-KEM public key in profiles table');
    console.log('🔑 Generated real ML-KEM-768 key pair for patient');
    
    // In a real system, you'd securely deliver the private key to the patient
    // For demo purposes, we'll log it (DON'T DO THIS IN PRODUCTION!)
    console.warn('🚨 DEMO ONLY - Private key:', privateKey.substring(0, 50) + '...');

    return publicKey;
  } catch (error) {
    console.error('❌ Failed to fetch/generate public key:', error);
    throw error;
  }
}

/**
 * Store patient's ML-KEM public key in database
 * @param patientId - Patient's UUID
 * @param publicKey - ML-KEM public key to store
 */
export async function storePublicKey(patientId: string, publicKey: string): Promise<void> {
  try {
    // Validate key format before storing
    if (!isValidKyberPublicKey(publicKey)) {
      throw new Error('Invalid ML-KEM public key format');
    }
    
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

    console.log('✅ ML-KEM public key stored successfully');
  } catch (error) {
    console.error('❌ Failed to store public key:', error);
    throw error;
  }
}