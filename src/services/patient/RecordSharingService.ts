
import { BaseService, ServiceResponse } from '../BaseService';
import { SharingPermission } from '@/types/medical';
import { ValidationError, AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { sanitizeInput } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';
import { patientProfileService } from './PatientProfileService';

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface SharingPermissionFilters {
  granteeId?: string;
  permissionType?: 'read' | 'write';
  status?: 'active' | 'expired' | 'all';
}

interface CreateSharingPermissionInput {
  medicalRecordId: string;
  granteeId: string;
  permissionType: 'read' | 'write';
  expiresAt?: string;
}

export class RecordSharingService extends BaseService {
  private validateSharingInput(data: CreateSharingPermissionInput): void {
    if (!data.medicalRecordId || typeof data.medicalRecordId !== 'string') {
      throw new ValidationError('Medical record ID is required and must be a string');
    }

    if (!data.granteeId || typeof data.granteeId !== 'string') {
      throw new ValidationError('Grantee ID is required and must be a string');
    }

    if (!data.permissionType || !['read', 'write'].includes(data.permissionType)) {
      throw new ValidationError('Permission type must be "read" or "write"');
    }

    if (data.expiresAt) {
      const expiryDate = new Date(data.expiresAt);
      if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
        throw new ValidationError('Expiry date must be a valid future date');
      }
    }
  }

  async shareRecordWithProvider(input: CreateSharingPermissionInput): Promise<ServiceResponse<SharingPermission>> {
    try {
      const context = await this.validateAuthentication();
      
      this.validateSharingInput(input);

      const sanitizedRecordId = sanitizeInput(input.medicalRecordId);
      const sanitizedGranteeId = sanitizeInput(input.granteeId);
      const sanitizedExpiresAt = input.expiresAt ? sanitizeInput(input.expiresAt) : undefined;

      if (!await this.validatePermission('create:consent_records', context)) {
        throw new AuthorizationError('Insufficient permissions to share records');
      }

      const patientResult = await patientProfileService.getCurrentPatient();
      if (!patientResult.success || !patientResult.data) {
        return this.createErrorResponse('Patient record not found', 404);
      }

      // Verify the medical record belongs to the current user
      const { data: record, error: recordError } = await supabase
        .from('medical_records')
        .select('patient_id')
        .eq('id', sanitizedRecordId)
        .single();

      if (recordError) {
        if (recordError.code === 'PGRST116') {
          throw new NotFoundError('Medical record');
        }
        return this.handleError(recordError, 'shareRecordWithProvider');
      }

      if (record.patient_id !== patientResult.data.id) {
        throw new AuthorizationError('Cannot share records that do not belong to you');
      }

      // Check for existing permission
      const { data: existingPermission } = await supabase
        .from('sharing_permissions')
        .select('*')
        .eq('patient_id', patientResult.data.id)
        .eq('grantee_id', sanitizedGranteeId)
        .eq('medical_record_id', sanitizedRecordId)
        .maybeSingle();

      if (existingPermission) {
        throw new ValidationError('Sharing permission already exists for this record and grantee');
      }

      const { data: permission, error } = await supabase
        .from('sharing_permissions')
        .insert({
          patient_id: patientResult.data.id,
          grantee_id: sanitizedGranteeId,
          medical_record_id: sanitizedRecordId,
          permission_type: input.permissionType,
          expires_at: sanitizedExpiresAt || null
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'shareRecordWithProvider');
      }

      const typedPermission: SharingPermission = {
        ...permission,
        permission_type: permission.permission_type as 'read' | 'write'
      };

      return this.createSuccessResponse(typedPermission, {
        operation: 'shareRecordWithProvider',
        permissionType: input.permissionType,
        hasExpiry: !!sanitizedExpiresAt
      });
    } catch (error) {
      return this.handleError(error, 'shareRecordWithProvider');
    }
  }

  async getSharingPermissions(
    options: PaginationOptions = {},
    filters: SharingPermissionFilters = {}
  ): Promise<ServiceResponse<{ permissions: SharingPermission[]; totalCount: number; pagination: any }>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read sharing permissions');
      }

      const patientResult = await patientProfileService.getCurrentPatient();
      if (!patientResult.success || !patientResult.data) {
        return this.createErrorResponse('Patient record not found', 404);
      }

      const limit = Math.min(Math.max(options.limit || 10, 1), 100);
      const offset = Math.max(options.offset || 0, 0);

      let query = supabase
        .from('sharing_permissions')
        .select('*', { count: 'exact' })
        .eq('patient_id', patientResult.data.id);

      if (filters.granteeId) {
        query = query.eq('grantee_id', filters.granteeId);
      }

      if (filters.permissionType) {
        query = query.eq('permission_type', filters.permissionType);
      }

      if (filters.status === 'active') {
        query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
      } else if (filters.status === 'expired') {
        query = query.lt('expires_at', new Date().toISOString());
      }

      const { data: permissions, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return this.handleError(error, 'getSharingPermissions');
      }

      const typedPermissions: SharingPermission[] = (permissions || []).map(permission => ({
        ...permission,
        permission_type: permission.permission_type as 'read' | 'write'
      }));

      return this.createSuccessResponse({
        permissions: typedPermissions,
        totalCount: count || 0,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < (count || 0)
        }
      }, {
        operation: 'getSharingPermissions',
        count: typedPermissions.length
      });
    } catch (error) {
      return this.handleError(error, 'getSharingPermissions');
    }
  }

  async getSharingPermission(permissionId: string): Promise<ServiceResponse<SharingPermission>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!permissionId) {
        throw new ValidationError('Permission ID is required');
      }

      const sanitizedId = sanitizeInput(permissionId);

      const { data: permission, error } = await supabase
        .from('sharing_permissions')
        .select('*, patients!inner(user_id)')
        .eq('id', sanitizedId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Sharing permission');
        }
        return this.handleError(error, 'getSharingPermission');
      }

      const permissionOwnerId = (permission as any).patients.user_id;
      const hasOwnership = await this.validateOwnership(permissionOwnerId, context);
      const hasViewAccess = permission.grantee_id === context.userId;

      if (!hasOwnership && !hasViewAccess) {
        throw new AuthorizationError('Cannot view permissions that do not belong to you');
      }

      const typedPermission: SharingPermission = {
        ...permission,
        permission_type: permission.permission_type as 'read' | 'write'
      };

      return this.createSuccessResponse(typedPermission, {
        operation: 'getSharingPermission',
        hasOwnership,
        hasViewAccess
      });
    } catch (error) {
      return this.handleError(error, 'getSharingPermission');
    }
  }

  async updateSharingPermission(
    permissionId: string,
    updates: { permissionType?: 'read' | 'write'; expiresAt?: string }
  ): Promise<ServiceResponse<SharingPermission>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!permissionId) {
        throw new ValidationError('Permission ID is required');
      }

      const sanitizedId = sanitizeInput(permissionId);

      if (updates.permissionType && !['read', 'write'].includes(updates.permissionType)) {
        throw new ValidationError('Permission type must be "read" or "write"');
      }

      if (updates.expiresAt) {
        const expiryDate = new Date(updates.expiresAt);
        if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
          throw new ValidationError('Expiry date must be a valid future date');
        }
      }

      const { data: permission, error: fetchError } = await supabase
        .from('sharing_permissions')
        .select('*, patients!inner(user_id)')
        .eq('id', sanitizedId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new NotFoundError('Sharing permission');
        }
        return this.handleError(fetchError, 'updateSharingPermission');
      }

      const permissionOwnerId = (permission as any).patients.user_id;
      if (!await this.validateOwnership(permissionOwnerId, context)) {
        throw new AuthorizationError('Cannot update permissions that do not belong to you');
      }

      const updateFields: any = {};
      if (updates.permissionType) {
        updateFields.permission_type = updates.permissionType;
      }
      if (updates.expiresAt !== undefined) {
        updateFields.expires_at = updates.expiresAt;
      }

      if (Object.keys(updateFields).length === 0) {
        throw new ValidationError('No fields to update');
      }

      const { data: updatedPermission, error } = await supabase
        .from('sharing_permissions')
        .update(updateFields)
        .eq('id', sanitizedId)
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updateSharingPermission');
      }

      const typedPermission: SharingPermission = {
        ...updatedPermission,
        permission_type: updatedPermission.permission_type as 'read' | 'write'
      };

      return this.createSuccessResponse(typedPermission, {
        operation: 'updateSharingPermission'
      });
    } catch (error) {
      return this.handleError(error, 'updateSharingPermission');
    }
  }

  async revokeSharingPermission(permissionId: string): Promise<ServiceResponse<void>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!permissionId) {
        throw new ValidationError('Permission ID is required');
      }

      const sanitizedId = sanitizeInput(permissionId);

      const { data: permission, error: fetchError } = await supabase
        .from('sharing_permissions')
        .select('*, patients!inner(user_id)')
        .eq('id', sanitizedId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new NotFoundError('Sharing permission');
        }
        return this.handleError(fetchError, 'revokeSharingPermission');
      }

      const permissionOwnerId = (permission as any).patients.user_id;
      if (!await this.validateOwnership(permissionOwnerId, context)) {
        throw new AuthorizationError('Cannot revoke permissions that do not belong to you');
      }

      const { error } = await supabase
        .from('sharing_permissions')
        .delete()
        .eq('id', sanitizedId);

      if (error) {
        return this.handleError(error, 'revokeSharingPermission');
      }

      return this.createSuccessResponse(undefined, {
        operation: 'revokeSharingPermission'
      });
    } catch (error) {
      return this.handleError(error, 'revokeSharingPermission');
    }
  }
}

export const recordSharingService = new RecordSharingService();
