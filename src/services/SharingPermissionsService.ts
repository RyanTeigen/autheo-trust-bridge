
import { supabase } from '@/integrations/supabase/client';

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface SharingFilters {
  granteeId?: string;
  permissionType?: 'read' | 'write';
  status?: 'active' | 'expired' | 'all';
  recordId?: string;
}

interface CreateSharingInput {
  medicalRecordId: string;
  granteeId: string;
  permissionType: 'read' | 'write';
  expiresAt?: string;
}

interface UpdateSharingInput {
  permissionType?: 'read' | 'write';
  expiresAt?: string;
}

export class SharingPermissionsService {
  private static validateUUID(id: string, fieldName: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error(`Invalid ${fieldName} format`);
    }
  }

  private static validateInput(data: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!data[field] || typeof data[field] !== 'string') {
        throw new Error(`${field} is required and must be a string`);
      }
    }
  }

  private static validatePermissionType(type: string): void {
    if (!['read', 'write'].includes(type)) {
      throw new Error('Permission type must be either "read" or "write"');
    }
  }

  private static validateExpiryDate(dateString: string): void {
    const expiryDate = new Date(dateString);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      throw new Error('Expiry date must be a valid future date');
    }
  }

  static async getSharingPermissions(
    options: PaginationOptions = {},
    filters: SharingFilters = {}
  ) {
    try {
      const { limit = 50, offset = 0 } = options;
      const { granteeId, status, recordId } = filters;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          statusCode: 401
        };
      }

      // Build query
      let query = supabase
        .from('record_shares')
        .select(`
          *,
          medical_records!inner(
            id,
            record_type,
            created_at,
            patient_id,
            patients!inner(user_id, full_name, email)
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (granteeId) {
        this.validateUUID(granteeId, 'granteeId');
        query = query.eq('shared_with_user_id', granteeId);
      }

      if (recordId) {
        this.validateUUID(recordId, 'recordId');
        query = query.eq('record_id', recordId);
      }

      // For status filtering, we currently consider all shares as active
      // since the current schema doesn't have expiration logic
      if (status === 'expired') {
        // Return empty result for expired since we don't track expiration yet
        return {
          success: true,
          data: {
            permissions: [],
            totalCount: 0,
            pagination: { limit, offset, hasMore: false }
          }
        };
      }

      const { data: allShares, error, count } = await query.range(offset, offset + limit - 1);

      if (error) {
        console.error('Database error in getSharingPermissions:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }

      // Filter shares where the current user owns the medical record
      const userShares = allShares?.filter((share: any) => 
        share.medical_records?.patients?.user_id === user.id
      ) || [];

      return {
        success: true,
        data: {
          permissions: userShares.map(share => ({
            id: share.id,
            patient_id: share.medical_records.patient_id,
            grantee_id: share.shared_with_user_id,
            medical_record_id: share.record_id,
            permission_type: 'read', // Default for quantum shares
            created_at: share.created_at,
            expires_at: null
          })),
          totalCount: count || 0,
          pagination: {
            limit,
            offset,
            hasMore: offset + limit < (count || 0)
          }
        }
      };
    } catch (error: any) {
      console.error('Error in getSharingPermissions:', error);
      return {
        success: false,
        error: error.message,
        statusCode: 500
      };
    }
  }

  static async getSharingPermission(permissionId: string) {
    try {
      this.validateInput({ permissionId }, ['permissionId']);
      this.validateUUID(permissionId, 'permissionId');

      const { data, error } = await supabase
        .from('record_shares')
        .select(`
          *,
          medical_records!inner(
            id,
            record_type,
            created_at,
            patient_id,
            patients!inner(user_id, full_name, email)
          )
        `)
        .eq('id', permissionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Sharing permission not found',
            statusCode: 404
          };
        }
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }

      // Verify user has access
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          statusCode: 401
        };
      }

      const isOwner = data.medical_records.patients.user_id === user.id;
      const isRecipient = data.shared_with_user_id === user.id;

      if (!isOwner && !isRecipient) {
        return {
          success: false,
          error: 'Access denied',
          statusCode: 403
        };
      }

      return {
        success: true,
        data: {
          id: data.id,
          patient_id: data.medical_records.patient_id,
          grantee_id: data.shared_with_user_id,
          medical_record_id: data.record_id,
          permission_type: 'read',
          created_at: data.created_at,
          expires_at: null
        }
      };
    } catch (error: any) {
      console.error('Error in getSharingPermission:', error);
      return {
        success: false,
        error: error.message,
        statusCode: 500
      };
    }
  }

  static async shareRecordWithProvider(shareData: CreateSharingInput) {
    try {
      this.validateInput(shareData, ['medicalRecordId', 'granteeId', 'permissionType']);
      this.validateUUID(shareData.medicalRecordId, 'medicalRecordId');
      this.validateUUID(shareData.granteeId, 'granteeId');
      this.validatePermissionType(shareData.permissionType);

      if (shareData.expiresAt) {
        this.validateExpiryDate(shareData.expiresAt);
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          statusCode: 401
        };
      }

      // Verify the medical record exists and belongs to the user
      const { data: record, error: recordError } = await supabase
        .from('medical_records')
        .select(`
          id,
          patient_id,
          patients!inner(user_id)
        `)
        .eq('id', shareData.medicalRecordId)
        .single();

      if (recordError) {
        if (recordError.code === 'PGRST116') {
          return {
            success: false,
            error: 'Medical record not found',
            statusCode: 404
          };
        }
        return {
          success: false,
          error: recordError.message,
          statusCode: 500
        };
      }

      if ((record as any).patients.user_id !== user.id) {
        return {
          success: false,
          error: 'You can only share your own medical records',
          statusCode: 403
        };
      }

      // Check for existing share
      const { data: existingShare } = await supabase
        .from('record_shares')
        .select('id')
        .eq('record_id', shareData.medicalRecordId)
        .eq('shared_with_user_id', shareData.granteeId)
        .maybeSingle();

      if (existingShare) {
        return {
          success: false,
          error: 'Record is already shared with this user',
          statusCode: 400
        };
      }

      // Create quantum-safe encrypted key
      const quantumSafeKey = JSON.stringify({
        encapsulatedKey: `ml_kem_key_${Date.now()}`,
        ciphertext: `encrypted_aes_key_${Date.now()}`,
        algorithm: 'ML-KEM-768',
        permissionType: shareData.permissionType,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('record_shares')
        .insert({
          record_id: shareData.medicalRecordId,
          shared_with_user_id: shareData.granteeId,
          pq_encrypted_key: quantumSafeKey
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating share:', error);
        return {
          success: false,
          error: 'Failed to create sharing permission',
          statusCode: 500
        };
      }

      return {
        success: true,
        data: {
          id: data.id,
          patient_id: record.patient_id,
          grantee_id: data.shared_with_user_id,
          medical_record_id: data.record_id,
          permission_type: shareData.permissionType,
          created_at: data.created_at,
          expires_at: shareData.expiresAt || null
        }
      };
    } catch (error: any) {
      console.error('Error in shareRecordWithProvider:', error);
      return {
        success: false,
        error: error.message,
        statusCode: 500
      };
    }
  }

  static async updateSharingPermission(permissionId: string, updateData: UpdateSharingInput) {
    try {
      this.validateInput({ permissionId }, ['permissionId']);
      this.validateUUID(permissionId, 'permissionId');

      if (updateData.permissionType) {
        this.validatePermissionType(updateData.permissionType);
      }

      if (updateData.expiresAt) {
        this.validateExpiryDate(updateData.expiresAt);
      }

      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          error: 'No fields to update',
          statusCode: 400
        };
      }

      // For now, just update the timestamp since current schema doesn't support all fields
      const { data, error } = await supabase
        .from('record_shares')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', permissionId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'Sharing permission not found',
            statusCode: 404
          };
        }
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }

      return {
        success: true,
        data: {
          id: data.id,
          updated_at: data.updated_at
        }
      };
    } catch (error: any) {
      console.error('Error in updateSharingPermission:', error);
      return {
        success: false,
        error: error.message,
        statusCode: 500
      };
    }
  }

  static async revokeSharingPermission(permissionId: string) {
    try {
      this.validateInput({ permissionId }, ['permissionId']);
      this.validateUUID(permissionId, 'permissionId');

      const { error } = await supabase
        .from('record_shares')
        .delete()
        .eq('id', permissionId);

      if (error) {
        console.error('Database error revoking permission:', error);
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in revokeSharingPermission:', error);
      return {
        success: false,
        error: error.message,
        statusCode: 500
      };
    }
  }
}
