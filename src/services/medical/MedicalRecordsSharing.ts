import { BaseService, ServiceResponse } from '../BaseService';
import { AuthorizationError, ValidationError, NotFoundError } from '@/utils/errorHandling';
import { supabase } from '@/integrations/supabase/client';
import { hybridEncrypt } from '@/utils/hybrid-encryption';
import { mlkemEncapsulate } from '@/utils/pq-mlkem';
import { MLKEMKeyService } from '../security/MLKEMKeyService';
import { MedicalRecordsRepository } from '../repositories/MedicalRecordsRepository';
import { PatientRecordsService } from '../PatientRecordsService';

interface ShareRecordInput {
  recordId: string;
  recipientUserId: string;
}

interface RecordShare {
  id: string;
  record_id: string;
  shared_with_user_id: string;
  pq_encrypted_key: string;
  created_at: string;
  updated_at: string;
}

interface RevokedShare {
  id: string;
  record_id: string;
  revoked_by: string;
  revoked_at: string;
  reason?: string;
}

export class MedicalRecordsSharing extends BaseService {
  /**
   * Share a medical record with another user using post-quantum encryption
   */
  async shareRecord(input: ShareRecordInput): Promise<ServiceResponse<{ shareId: string }>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('create:consent_records', context)) {
        throw new AuthorizationError('Insufficient permissions to share records');
      }

      // Validate input
      if (!input.recordId || !input.recipientUserId) {
        throw new ValidationError('Record ID and recipient user ID are required');
      }

      // Get current patient
      const patientResult = await PatientRecordsService.getCurrentPatient();
      if (!patientResult.success || !patientResult.data) {
        return this.createErrorResponse('Patient record not found', 404);
      }

      // Verify the medical record belongs to the current user
      const record = await MedicalRecordsRepository.findById(input.recordId);
      if (record.patient_id !== patientResult.data.id) {
        throw new AuthorizationError('Cannot share records that do not belong to you');
      }

      // Get recipient's public key
      const recipientPublicKey = await MLKEMKeyService.getUserPublicKey(input.recipientUserId);
      if (!recipientPublicKey) {
        throw new ValidationError('Recipient does not have quantum-safe encryption enabled');
      }

      // Generate shared secret and encapsulated key using ML-KEM
      const encapsulationResult = await mlkemEncapsulate(recipientPublicKey);

      // Create the share record
      const { data: shareRecord, error } = await supabase
        .from('record_shares')
        .insert({
          record_id: input.recordId,
          shared_with_user_id: input.recipientUserId,
          pq_encrypted_key: JSON.stringify(encapsulationResult)
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'shareRecord');
      }

      return this.createSuccessResponse({ shareId: shareRecord.id }, {
        operation: 'shareRecord',
        recordId: input.recordId,
        recipientUserId: input.recipientUserId
      });
    } catch (error) {
      return this.handleError(error, 'shareRecord');
    }
  }

  /**
   * Get all records shared with the current user (excluding revoked ones)
   */
  async getSharedWithMe(): Promise<ServiceResponse<RecordShare[]>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read shared records');
      }

      // Get active shares that haven't been revoked
      const { data: shares, error } = await supabase
        .from('record_shares')
        .select('*')
        .eq('shared_with_user_id', context.userId)
        .not('record_id', 'in', 
          supabase
            .from('revoked_shares')
            .select('record_id')
        )
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error, 'getSharedWithMe');
      }

      return this.createSuccessResponse(shares || [], {
        operation: 'getSharedWithMe',
        count: shares?.length || 0
      });
    } catch (error) {
      return this.handleError(error, 'getSharedWithMe');
    }
  }

  /**
   * Get all shares created by the current user (excluding revoked ones)
   */
  async getMyShares(): Promise<ServiceResponse<RecordShare[]>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read sharing records');
      }

      const patientResult = await PatientRecordsService.getCurrentPatient();
      if (!patientResult.success || !patientResult.data) {
        return this.createErrorResponse('Patient record not found', 404);
      }

      // Get active shares that haven't been revoked
      const { data: shares, error } = await supabase
        .from('record_shares')
        .select(`
          *,
          medical_records!inner(patient_id)
        `)
        .eq('medical_records.patient_id', patientResult.data.id)
        .not('record_id', 'in', 
          supabase
            .from('revoked_shares')
            .select('record_id')
        )
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error, 'getMyShares');
      }

      return this.createSuccessResponse(shares || [], {
        operation: 'getMyShares',
        count: shares?.length || 0
      });
    } catch (error) {
      return this.handleError(error, 'getMyShares');
    }
  }

  /**
   * Revoke a record share by creating a revocation record
   */
  async revokeShare(shareId: string, reason?: string): Promise<ServiceResponse<void>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!shareId) {
        throw new ValidationError('Share ID is required');
      }

      // First verify the share exists and belongs to the current user
      const { data: share, error: fetchError } = await supabase
        .from('record_shares')
        .select(`
          *,
          medical_records!inner(
            patient_id,
            patients!inner(user_id)
          )
        `)
        .eq('id', shareId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new NotFoundError('Record share');
        }
        return this.handleError(fetchError, 'revokeShare');
      }

      // Check if current user owns the record
      const recordOwnerId = (share as any).medical_records.patients.user_id;
      if (!await this.validateOwnership(recordOwnerId, context)) {
        throw new AuthorizationError('Cannot revoke shares for records that do not belong to you');
      }

      // Check if already revoked
      const { data: existingRevocation } = await supabase
        .from('revoked_shares')
        .select('id')
        .eq('record_id', share.record_id)
        .maybeSingle();

      if (existingRevocation) {
        throw new ValidationError('This share has already been revoked');
      }

      // Create revocation record instead of deleting the share
      const { error: revokeError } = await supabase
        .from('revoked_shares')
        .insert({
          record_id: share.record_id,
          revoked_by: context.userId,
          reason: reason || 'Access revoked by record owner'
        });

      if (revokeError) {
        return this.handleError(revokeError, 'revokeShare');
      }

      return this.createSuccessResponse(undefined, {
        operation: 'revokeShare',
        shareId,
        recordId: share.record_id
      });
    } catch (error) {
      return this.handleError(error, 'revokeShare');
    }
  }

  /**
   * Get revocation history for the current user's records
   */
  async getRevocationHistory(): Promise<ServiceResponse<RevokedShare[]>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read revocation history');
      }

      const { data: revocations, error } = await supabase
        .from('revoked_shares')
        .select('*')
        .eq('revoked_by', context.userId)
        .order('revoked_at', { ascending: false });

      if (error) {
        return this.handleError(error, 'getRevocationHistory');
      }

      return this.createSuccessResponse(revocations || [], {
        operation: 'getRevocationHistory',
        count: revocations?.length || 0
      });
    } catch (error) {
      return this.handleError(error, 'getRevocationHistory');
    }
  }

  /**
   * Check if a specific record share has been revoked
   */
  async isShareRevoked(recordId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { data: revocation, error } = await supabase
        .from('revoked_shares')
        .select('id')
        .eq('record_id', recordId)
        .maybeSingle();

      if (error) {
        return this.handleError(error, 'isShareRevoked');
      }

      return this.createSuccessResponse(!!revocation, {
        operation: 'isShareRevoked',
        recordId,
        isRevoked: !!revocation
      });
    } catch (error) {
      return this.handleError(error, 'isShareRevoked');
    }
  }

  /**
   * Get a shared record with decryption
   */
  async getSharedRecord(shareId: string): Promise<ServiceResponse<any>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!shareId) {
        throw new ValidationError('Share ID is required');
      }

      // Get the share record and verify access
      const { data: share, error: shareError } = await supabase
        .from('record_shares')
        .select('*')
        .eq('id', shareId)
        .eq('shared_with_user_id', context.userId)
        .single();

      if (shareError) {
        if (shareError.code === 'PGRST116') {
          throw new NotFoundError('Record share');
        }
        return this.handleError(shareError, 'getSharedRecord');
      }

      // Get the medical record
      const record = await MedicalRecordsRepository.findById(share.record_id);

      // Get user's private key for decryption
      const privateKeyB64 = localStorage.getItem(`mlkem_private_key_${context.userId}`);
      if (!privateKeyB64) {
        throw new ValidationError('Private key not found - please re-register for quantum-safe encryption');
      }

      // Decrypt the shared AES key
      const encryptedAESKey = JSON.parse(share.pq_encrypted_key);
      // Note: This would need the mlkemDecapsulate function implementation
      // For now, we'll return the encrypted record info
      
      return this.createSuccessResponse({
        shareId: share.id,
        recordId: record.id,
        recordType: record.record_type,
        sharedAt: share.created_at,
        // In a full implementation, we would decrypt the record data here
        encrypted: true
      }, {
        operation: 'getSharedRecord',
        shareId
      });
    } catch (error) {
      return this.handleError(error, 'getSharedRecord');
    }
  }
}

export const medicalRecordsSharing = new MedicalRecordsSharing();
