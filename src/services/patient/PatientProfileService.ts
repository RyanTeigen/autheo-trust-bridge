
import { BaseService, ServiceResponse } from '../BaseService';
import { Patient } from '@/types/medical';
import { ValidationError, AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { sanitizeInput } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';

export class PatientProfileService extends BaseService {
  async createOrUpdatePatient(patientData: Partial<Patient>): Promise<ServiceResponse<Patient>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('update:own_profile', context)) {
        throw new AuthorizationError('Insufficient permissions to update patient profile');
      }

      const sanitizedData = sanitizeInput(patientData);

      const { data: patient, error } = await supabase
        .from('patients')
        .upsert({
          id: context.userId,
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

export const patientProfileService = new PatientProfileService();
