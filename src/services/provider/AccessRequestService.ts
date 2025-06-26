
import { BaseService, ServiceResponse } from '../BaseService';
import { ValidationError, AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { sanitizeInput } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';

interface AccessRequestInput {
  patientEmail: string;
}

interface AccessRequestResult {
  id: string;
  patientEmail: string;
  requestedAt: string;
  status: 'pending';
}

export class AccessRequestService extends BaseService {
  async requestPatientAccess(input: AccessRequestInput): Promise<ServiceResponse<AccessRequestResult>> {
    try {
      const context = await this.validateAuthentication();
      
      // Validate provider role
      if (!await this.validatePermission('create:access_requests', context)) {
        throw new AuthorizationError('Only providers can request patient access');
      }

      // Validate and sanitize input
      if (!input.patientEmail || typeof input.patientEmail !== 'string') {
        throw new ValidationError('Patient email is required');
      }

      const sanitizedEmail = sanitizeInput(input.patientEmail.toLowerCase().trim());
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        throw new ValidationError('Invalid email format');
      }

      // Find patient by email
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id, user_id, email, full_name')
        .eq('email', sanitizedEmail)
        .maybeSingle();

      if (patientError) {
        return this.handleError(patientError, 'requestPatientAccess');
      }

      if (!patient) {
        throw new NotFoundError('Patient with this email address');
      }

      // Find the patient's latest medical record
      const { data: latestRecord, error: recordError } = await supabase
        .from('medical_records')
        .select('id, record_type, created_at')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recordError) {
        return this.handleError(recordError, 'requestPatientAccess');
      }

      if (!latestRecord) {
        throw new NotFoundError('Medical records for this patient');
      }

      // Check if there's already a pending request
      const { data: existingRequest } = await supabase
        .from('sharing_permissions')
        .select('id, permission_type, expires_at')
        .eq('patient_id', patient.id)
        .eq('grantee_id', context.userId)
        .eq('medical_record_id', latestRecord.id)
        .maybeSingle();

      if (existingRequest) {
        // Check if it's still active (not expired)
        const now = new Date();
        const isExpired = existingRequest.expires_at && new Date(existingRequest.expires_at) < now;
        
        if (!isExpired) {
          throw new ValidationError('Access request already exists for this patient');
        }
      }

      // Create new sharing permission with pending status
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expire in 30 days

      const { data: sharingPermission, error: createError } = await supabase
        .from('sharing_permissions')
        .insert({
          patient_id: patient.id,
          grantee_id: context.userId,
          medical_record_id: latestRecord.id,
          permission_type: 'read',
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (createError) {
        return this.handleError(createError, 'requestPatientAccess');
      }

      // TODO: In a real system, you would send a notification to the patient
      // about the access request

      return this.createSuccessResponse({
        id: sharingPermission.id,
        patientEmail: sanitizedEmail,
        requestedAt: sharingPermission.created_at,
        status: 'pending' as const
      }, {
        operation: 'requestPatientAccess',
        patientId: patient.id,
        recordId: latestRecord.id
      });
    } catch (error) {
      return this.handleError(error, 'requestPatientAccess');
    }
  }

  async getMyAccessRequests(): Promise<ServiceResponse<any[]>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read access requests');
      }

      const { data: requests, error } = await supabase
        .from('sharing_permissions')
        .select(`
          id,
          permission_type,
          created_at,
          expires_at,
          patients!inner(
            id,
            email,
            full_name
          ),
          medical_records!inner(
            id,
            record_type,
            created_at
          )
        `)
        .eq('grantee_id', context.userId)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error, 'getMyAccessRequests');
      }

      const formattedRequests = (requests || []).map(request => ({
        id: request.id,
        patientEmail: (request as any).patients.email,
        patientName: (request as any).patients.full_name,
        permissionType: request.permission_type,
        requestedAt: request.created_at,
        expiresAt: request.expires_at,
        recordType: (request as any).medical_records.record_type,
        status: this.getRequestStatus(request.expires_at)
      }));

      return this.createSuccessResponse(formattedRequests, {
        operation: 'getMyAccessRequests',
        count: formattedRequests.length
      });
    } catch (error) {
      return this.handleError(error, 'getMyAccessRequests');
    }
  }

  private getRequestStatus(expiresAt: string | null): 'active' | 'expired' {
    if (!expiresAt) return 'active';
    return new Date(expiresAt) > new Date() ? 'active' : 'expired';
  }
}

export const accessRequestService = new AccessRequestService();
