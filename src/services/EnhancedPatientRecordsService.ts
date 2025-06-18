
import { BaseService, ServiceResponse } from './BaseService';
import { Patient, SharingPermission } from '@/types/medical';
import { ValidationError, AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { sanitizeInput } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';

export class EnhancedPatientRecordsService extends BaseService {
  async createOrUpdatePatient(patientData: Partial<Patient>): Promise<ServiceResponse<Patient>> {
    try {
      // Validate authentication
      const context = await this.validateAuthentication();
      
      // Validate user has permission to update their own profile
      if (!await this.validatePermission('update:own_profile', context)) {
        throw new AuthorizationError('Insufficient permissions to update patient profile');
      }

      // Sanitize input data
      const sanitizedData = sanitizeInput(patientData);

      const { data: patient, error } = await supabase
        .from('patients')
        .upsert({
          id: context.userId, // Use auth user ID as patient ID
          user_id: context.userId,
          ...sanitizedData
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createOrUpdatePatient');
      }

      return this.createSuccessResponse(patient, {
        operation: 'createOrUpdatePatient',
        isUpdate: !!patientData.id
      });
    } catch (error) {
      return this.handleError(error, 'createOrUpdatePatient');
    }
  }

  async getCurrentPatient(): Promise<ServiceResponse<Patient | null>> {
    try {
      // Validate authentication
      const context = await this.validateAuthentication();
      
      // Validate user has permission to read their own data
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read patient data');
      }

      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', context.userId)
        .maybeSingle();

      if (error) {
        return this.handleError(error, 'getCurrentPatient');
      }

      return this.createSuccessResponse(patient, {
        operation: 'getCurrentPatient',
        exists: !!patient
      });
    } catch (error) {
      return this.handleError(error, 'getCurrentPatient');
    }
  }

  async getPatient(patientId: string): Promise<ServiceResponse<Patient>> {
    try {
      // Validate authentication
      const context = await this.validateAuthentication();
      
      // Validate input
      if (!patientId) {
        throw new ValidationError('Patient ID is required');
      }

      const sanitizedId = sanitizeInput(patientId);

      // Check if user has permission to view this specific patient
      const hasOwnership = await this.validateOwnership(sanitizedId, context);
      const hasProviderAccess = await this.validatePermission('read:patient_data', context);

      if (!hasOwnership && !hasProviderAccess) {
        throw new AuthorizationError('Insufficient permissions to access patient data');
      }

      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', sanitizedId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Patient');
        }
        return this.handleError(error, 'getPatient');
      }

      return this.createSuccessResponse(patient, {
        operation: 'getPatient',
        hasOwnership,
        hasProviderAccess
      });
    } catch (error) {
      return this.handleError(error, 'getPatient');
    }
  }

  async shareRecordWithProvider(
    medicalRecordId: string,
    granteeId: string,
    permissionType: 'read' | 'write',
    expiresAt?: string
  ): Promise<ServiceResponse<SharingPermission>> {
    try {
      // Validate authentication
      const context = await this.validateAuthentication();
      
      // Validate inputs
      if (!medicalRecordId || !granteeId || !permissionType) {
        throw new ValidationError('Medical record ID, grantee ID, and permission type are required');
      }

      if (!['read', 'write'].includes(permissionType)) {
        throw new ValidationError('Permission type must be "read" or "write"');
      }

      const sanitizedRecordId = sanitizeInput(medicalRecordId);
      const sanitizedGranteeId = sanitizeInput(granteeId);
      const sanitizedExpiresAt = expiresAt ? sanitizeInput(expiresAt) : undefined;

      // Validate user has permission to create consent records
      if (!await this.validatePermission('create:consent_records', context)) {
        throw new AuthorizationError('Insufficient permissions to share records');
      }

      // Get current patient
      const patientResult = await this.getCurrentPatient();
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

      // Type assert the permission_type to match our strict type
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
      // Validate authentication
      const context = await this.validateAuthentication();
      
      // Validate user has permission to read consent records
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read sharing permissions');
      }

      const patientResult = await this.getCurrentPatient();
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

      // Type assert the permission_type for each permission to match our strict type
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
      // Validate authentication
      const context = await this.validateAuthentication();
      
      // Validate input
      if (!permissionId) {
        throw new ValidationError('Permission ID is required');
      }

      const sanitizedId = sanitizeInput(permissionId);

      // First check if permission exists and belongs to current user
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

      // Validate ownership
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

export const enhancedPatientRecordsService = new EnhancedPatientRecordsService();
