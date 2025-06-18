
import { BaseService, ServiceResponse } from '../BaseService';
import { Patient } from '@/types/medical';
import { ValidationError, AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { sanitizeInput } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export class PatientQuery extends BaseService {
  async getPatients(options: PaginationOptions = {}): Promise<ServiceResponse<Patient[]>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read patient data');
      }

      const limit = Math.min(Math.max(options.limit || 10, 1), 100);
      const offset = Math.max(options.offset || 0, 0);

      const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', context.userId)
        .order('full_name')
        .range(offset, offset + limit - 1);

      if (error) {
        return this.handleError(error, 'getPatients');
      }

      return this.createSuccessResponse(patients || [], {
        operation: 'getPatients',
        count: patients?.length || 0,
        pagination: { limit, offset }
      });
    } catch (error) {
      return this.handleError(error, 'getPatients');
    }
  }

  async getCurrentPatient(): Promise<ServiceResponse<Patient | null>> {
    try {
      const context = await this.validateAuthentication();
      
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
      const context = await this.validateAuthentication();
      
      if (!patientId) {
        throw new ValidationError('Patient ID is required');
      }

      const sanitizedId = sanitizeInput(patientId);

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
}
