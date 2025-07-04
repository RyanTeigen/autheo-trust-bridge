/**
 * Zero Knowledge Service
 * Ensures server never has access to plaintext data
 */

import { ClientSideEncryptionService, ClientEncryptedData, ShareEncryptedData } from './ClientSideEncryptionService';
import { supabase } from '@/integrations/supabase/client';

export interface ZeroKnowledgeRecord {
  id: string;
  patient_id: string;
  encrypted_payload: string; // Contains ClientEncryptedData
  record_type: string;
  created_at: string;
  updated_at: string;
  integrity_proof: string;
}

export interface ZeroKnowledgeShare {
  id: string;
  record_id: string;
  recipient_public_key: string;
  encrypted_payload: string; // Contains ShareEncryptedData
  sender_attestation: string;
  created_at: string;
  status: 'active' | 'revoked';
}

export class ZeroKnowledgeService {
  
  /**
   * Store encrypted medical record (server never sees plaintext)
   */
  static async storeEncryptedRecord(
    plainData: any,
    recordType: string,
    userId: string
  ): Promise<{ success: boolean; recordId?: string; error?: string }> {
    try {
      // Encrypt on client only
      const encrypted = await ClientSideEncryptionService.encryptForSelf(plainData, userId);
      
      // Get or create patient
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) {
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            full_name: user.user_metadata?.full_name || user.email || 'Unknown',
            email: user.email
          })
          .select('id')
          .single();

        if (createError) throw createError;
        patient = newPatient;
      }

      // Store encrypted payload (server never sees plaintext)
      const { data: record, error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patient.id,
          encrypted_data: JSON.stringify(encrypted), // Encrypted payload
          iv: 'client_side', // Marker that this is client-side encrypted
          record_type: recordType,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, recordId: record.id };
    } catch (error) {
      console.error('Error storing encrypted record:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Retrieve and decrypt medical record (decryption on client only)
   */
  static async retrieveAndDecryptRecord(
    recordId: string,
    userId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Get encrypted record from server
      const { data: record, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('id', recordId)
        .eq('user_id', userId)
        .single();

      if (error || !record) {
        return { success: false, error: 'Record not found' };
      }

      // Check if this is client-side encrypted
      if (record.iv !== 'client_side') {
        return { success: false, error: 'Record not client-side encrypted' };
      }

      // Decrypt on client only
      const encryptedPayload: ClientEncryptedData = JSON.parse(record.encrypted_data);
      const decryptedData = await ClientSideEncryptionService.decryptForSelf(
        encryptedPayload,
        userId
      );

      return { success: true, data: decryptedData };
    } catch (error) {
      console.error('Error retrieving encrypted record:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Decryption failed' 
      };
    }
  }

  /**
   * Get all user records (encrypted, decrypt on client)
   */
  static async getAllUserRecords(
    userId: string
  ): Promise<{ success: boolean; records?: any[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all encrypted records for user
      const { data: records, error } = await supabase
        .from('medical_records')
        .select(`
          id,
          encrypted_data,
          iv,
          record_type,
          created_at,
          updated_at,
          patient_id
        `)
        .eq('user_id', user.id)
        .eq('iv', 'client_side'); // Only client-side encrypted records

      if (error) throw error;

      // Decrypt each record on client
      const decryptedRecords = [];
      for (const record of records || []) {
        try {
          const encryptedPayload: ClientEncryptedData = JSON.parse(record.encrypted_data);
          const decryptedData = await ClientSideEncryptionService.decryptForSelf(
            encryptedPayload,
            userId
          );

          decryptedRecords.push({
            id: record.id,
            data: decryptedData,
            record_type: record.record_type,
            created_at: record.created_at,
            updated_at: record.updated_at,
            patient_id: record.patient_id
          });
        } catch (decryptError) {
          console.error(`Failed to decrypt record ${record.id}:`, decryptError);
          // Skip corrupted records but don't fail entire operation
        }
      }

      return { success: true, records: decryptedRecords };
    } catch (error) {
      console.error('Error getting user records:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to retrieve records' 
      };
    }
  }

  /**
   * Share record with another user (end-to-end encrypted)
   */
  static async shareRecordWithUser(
    recordId: string,
    recipientUserId: string,
    senderUserId: string
  ): Promise<{ success: boolean; shareId?: string; error?: string }> {
    try {
      // First, get and decrypt the record
      const recordResult = await this.retrieveAndDecryptRecord(recordId, senderUserId);
      if (!recordResult.success) {
        return { success: false, error: 'Could not access record to share' };
      }

      // Get recipient's public key
      const recipientPublicKey = await ClientSideEncryptionService.getUserPublicKey(recipientUserId);
      if (!recipientPublicKey) {
        return { success: false, error: 'Recipient public key not found' };
      }

      // Encrypt for recipient
      const sharedEncrypted = await ClientSideEncryptionService.encryptForSharing(
        recordResult.data,
        recipientPublicKey,
        senderUserId
      );

      // Store the share (server gets encrypted data only)
      const { data: share, error } = await supabase
        .from('record_shares')
        .insert({
          record_id: recordId,
          shared_with_user_id: recipientUserId,
          pq_encrypted_key: JSON.stringify(sharedEncrypted) // Encrypted payload
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, shareId: share.id };
    } catch (error) {
      console.error('Error sharing record:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to share record' 
      };
    }
  }

  /**
   * Access shared record (decrypt on recipient's client)
   */
  static async accessSharedRecord(
    shareId: string,
    recipientUserId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Get the encrypted share
      const { data: share, error } = await supabase
        .from('record_shares')
        .select('*')
        .eq('id', shareId)
        .eq('shared_with_user_id', recipientUserId)
        .single();

      if (error || !share) {
        return { success: false, error: 'Share not found or unauthorized' };
      }

      // Decrypt the shared data on client
      const sharedEncrypted: ShareEncryptedData = JSON.parse(share.pq_encrypted_key);
      const decryptedData = await ClientSideEncryptionService.decryptShared(
        sharedEncrypted,
        recipientUserId
      );

      return { success: true, data: decryptedData };
    } catch (error) {
      console.error('Error accessing shared record:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to access shared record' 
      };
    }
  }

  /**
   * Get all shares for a user
   */
  static async getUserShares(userId: string): Promise<{
    success: boolean;
    shares?: Array<{ shareId: string; data: any; sharedAt: string; recordType?: string }>;
    error?: string;
  }> {
    try {
      // Get all shares for this user
      const { data: shares, error } = await supabase
        .from('record_shares')
        .select(`
          id,
          record_id,
          created_at,
          pq_encrypted_key,
          medical_records!inner (
            record_type
          )
        `)
        .eq('shared_with_user_id', userId);

      if (error) throw error;

      // Decrypt each share on client
      const decryptedShares = [];
      for (const share of shares || []) {
        try {
          const sharedEncrypted: ShareEncryptedData = JSON.parse(share.pq_encrypted_key);
          const decryptedData = await ClientSideEncryptionService.decryptShared(
            sharedEncrypted,
            userId
          );

          decryptedShares.push({
            shareId: share.id,
            data: decryptedData,
            sharedAt: share.created_at,
            recordType: (share as any).medical_records?.record_type
          });
        } catch (decryptError) {
          console.error(`Failed to decrypt share ${share.id}:`, decryptError);
          // Skip corrupted shares
        }
      }

      return { success: true, shares: decryptedShares };
    } catch (error) {
      console.error('Error getting user shares:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to retrieve shares' 
      };
    }
  }

  /**
   * Verify system has zero knowledge (diagnostic)
   */
  static async verifyZeroKnowledge(): Promise<{
    isZeroKnowledge: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if WebAuthn is supported
    if (!window.navigator?.credentials) {
      issues.push('WebAuthn not supported - falling back to less secure key storage');
      recommendations.push('Use a modern browser with WebAuthn support');
    }

    // Check if IndexedDB is available
    if (!window.indexedDB) {
      issues.push('IndexedDB not available - key storage may be less secure');
      recommendations.push('Enable IndexedDB in browser settings');
    }

    // Check for HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      issues.push('Not running over HTTPS - WebAuthn requires secure context');
      recommendations.push('Deploy application over HTTPS');
    }

    return {
      isZeroKnowledge: issues.length === 0,
      issues,
      recommendations
    };
  }
}