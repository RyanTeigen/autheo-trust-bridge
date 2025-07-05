/**
 * Frontend Hybrid Encryption Module
 * Combines AES encryption with Kyber quantum-safe public key encryption
 */

import * as AES from 'crypto-js/aes';
import * as encUtf8 from 'crypto-js/enc-utf8';
import * as encBase64 from 'crypto-js/enc-base64';
import { kyberEncrypt } from '@/utils/pq-kyber';

export interface EncryptedMedicalRecord {
  encryptedPayload: string;
  encryptedKey: string;
  iv: string;
  timestamp: string;
}

/**
 * Encrypt medical record using hybrid AES + Kyber encryption
 * @param record - The medical record data to encrypt
 * @param patientPublicKey - Patient's Kyber public key
 * @returns Encrypted payload and encrypted AES key
 */
export async function encryptMedicalRecord(
  record: string | object, 
  patientPublicKey: string
): Promise<EncryptedMedicalRecord> {
  try {
    // Generate random AES key (128-bit)
    const aesKey = crypto.getRandomValues(new Uint8Array(16));
    const keyStr = Array.from(aesKey).map((b) => String.fromCharCode(b)).join('');
    
    // Convert record to string if it's an object
    const recordStr = typeof record === 'string' ? record : JSON.stringify(record);
    
    // Encrypt the record with AES
    const encryptedPayload = AES.encrypt(recordStr, keyStr).toString();
    
    // Encrypt the AES key with Kyber
    const encryptedKey = await kyberEncrypt(keyStr, patientPublicKey);
    
    return {
      encryptedPayload,
      encryptedKey,
      iv: 'hybrid_encrypted', // Marker for hybrid encryption
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Medical record encryption failed:', error);
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a cryptographic hash for record anchoring
 * @param recordId - UUID of the medical record
 * @param patientId - UUID of the patient
 * @param recordType - Type of medical record
 * @param timestamp - Timestamp of the record
 * @returns SHA256 hash for blockchain anchoring
 */
export async function generateRecordHash(
  recordId: string,
  patientId: string,
  recordType: string,
  timestamp: string
): Promise<string> {
  const data = `${recordId}:${patientId}:${recordType}:${timestamp}`;
  
  // Use crypto.subtle for SHA-256 hashing
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create anchor log entry for blockchain provenance
 * @param recordId - UUID of the medical record
 * @param patientId - UUID of the patient
 * @param recordType - Type of medical record
 * @returns Promise that resolves when anchor is logged
 */
export async function anchorRecordToBlockchain(
  recordId: string,
  patientId: string,
  recordType: string
): Promise<{ status: string; hash: string }> {
  const timestamp = new Date().toISOString();
  const hash = await generateRecordHash(recordId, patientId, recordType, timestamp);
  
  try {
    // Import Supabase client dynamically to avoid circular dependencies
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Call the Supabase edge function to log the anchor
    const { data, error } = await supabase.functions.invoke('log_anchor', {
      body: {
        record_id: recordId,
        patient_id: patientId,
        type: recordType,
        timestamp,
        hash
      }
    });
    
    if (error) {
      throw new Error(`Anchoring failed: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Record anchoring failed:', error);
    throw new Error(`Anchoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}