
import { BaseService, ServiceResponse } from '../BaseService';
import { Patient } from '@/types/medical';
import { ValidationError, AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { sanitizeInput } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';
import { PatientValidation, PatientCreateInput, PatientUpdateInput } from './PatientValidation';

export class PatientCRUD extends BaseService {
  async createPatient(patientData: PatientCreateInput): Promise<ServiceResponse<Patient>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('update:own_profile', context)) {
        throw new AuthorizationError('Insufficient permissions to create patient profile');
      }

      PatientValidation.validatePatientInput(patientData, true);
      const sanitizedData = sanitizeInput(patientData);

      const { data: patient, error } = await supabase
        .from('patients')
        .insert({
          id: context.userId,
          user_id: context.userId,
          ...sanitizedData
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createPatient');
      }

      return this.createSuccessResponse(patient, {
        operation: 'createPatient'
      });
    } catch (error) {
      return this.handleError(error, 'createPatient');
    }
  }

  async updatePatient(patientId: string, patientData: PatientUpdateInput): Promise<ServiceResponse<Patient>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!patientId) {
        throw new ValidationError('Patient ID is required');
      }

      const sanitizedId = sanitizeInput(patientId);
      
      if (!await this.validateOwnership(sanitizedId, context)) {
        throw new AuthorizationError('Cannot update patient profile that does not belong to you');
      }

      PatientValidation.validatePatientInput(patientData, false);

      // Build dynamic update object
      const updateFields: any = {};
      Object.keys(patientData).forEach(key => {
        const value = patientData[key as keyof PatientUpdateInput];
        if (value !== undefined) {
          updateFields[key] = sanitizeInput(value);
        }
      });

      if (Object.keys(updateFields).length === 0) {
        throw new ValidationError('No fields to update');
      }

      const { data: patient, error } = await supabase
        .from('patients')
        .update(updateFields)
        .eq('id', sanitizedId)
        .eq('user_id', context.userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Patient');
        }
        return this.handleError(error, 'updatePatient');
      }

      return this.createSuccessResponse(patient, {
        operation: 'updatePatient'
      });
    } catch (error) {
      return this.handleError(error, 'updatePatient');
    }
  }

  async deletePatient(patientId: string): Promise<ServiceResponse<void>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!patientId) {
        throw new ValidationError('Patient ID is required');
      }

      const sanitizedId = sanitizeInput(patientId);

      if (!await this.validateOwnership(sanitizedId, context)) {
        throw new AuthorizationError('Cannot delete patient profile that does not belong to you');
      }

      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', sanitizedId)
        .eq('user_id', context.userId);

      if (error) {
        return this.handleError(error, 'deletePatient');
      }

      return this.createSuccessResponse(undefined, {
        operation: 'deletePatient'
      });
    } catch (error) {
      return this.handleError(error, 'deletePatient');
    }
  }
}
