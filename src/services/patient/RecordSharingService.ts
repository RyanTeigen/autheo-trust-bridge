
import { BaseService, ServiceResponse } from '../BaseService';
import { SharingPermission } from '@/types/medical';
import { ValidationError, AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { sanitizeInput } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';
import { patientProfileService } from './PatientProfileService';

export class RecordSharingService extends BaseService {
  async shareRecordWithProvider(
    medicalRecordId: string,
    granteeId: string,
    permissionType: 'read' | 'write',
    expiresAt?: string
  ): Promise<ServiceResponse<SharingPermission>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!medicalRecordId || !granteeId || !permissionType) {
        throw new ValidationError('Medical record ID, grantee ID, and permission type are required');
      }

      if (!['read', 'write'].includes(permissionType)) {
        throw new ValidationError('Permission type must be "read" or "write"');
      }

      const sanitizedRecordId = sanitizeInput(medicalRecordId);
      const sanitizedGranteeId = sanitizeInput(granteeId);
      const sanitizedExpiresAt = expiresAt ? sanitizeInput(expiresAt) : undefined;

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

      const { data: permission, error } = await supabase
        .from('sharing_permissions')
        .insert({
          patient_id: patientResult.data.id,
          grantee_id: sanitizedGranteeId,
          medical_record_id: sanitizedRecordId,
          permission_type: permissionType,
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
        permissionType,
        hasExpiry: !!sanitizedExpiresAt
      });
    } catch (error) {
      return this.handleError(error, 'shareRecordWithProvider');
    }
  }

  async getSharingPermissions(): Promise<ServiceResponse<SharingPermission[]>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read sharing permissions');
      }

      const patientResult = await patientProfileService.getCurrentPatient();
      if (!patientResult.success || !patientResult.data) {
        return this.createErrorResponse('Patient record not found', 404);
      }

      const { data: permissions, error } = await supabase
        .from('sharing_permissions')
        .select('*')
        .eq('patient_id', patientResult.data.id)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error, 'getSharingPermissions');
      }

      const typedPermissions: SharingPermission[] = (permissions || []).map(permission => ({
        ...permission,
        permission_type: permission.permission_type as 'read' | 'write'
      }));

      return this.createSuccessResponse(typedPermissions, {
        operation: 'getSharingPermissions',
        count: typedPermissions.length
      });
    } catch (error) {
      return this.handleError(error, 'getSharingPermissions');
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
