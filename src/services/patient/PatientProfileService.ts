import { BaseService, ServiceResponse } from '../BaseService';
import { Patient } from '@/types/medical';
import { ValidationError, AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { sanitizeInput } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface PatientCreateInput {
  full_name: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  address?: string;
  mrn?: string;
  allergies?: string[];
  emergency_contact?: string;
  insurance_info?: any;
}

interface PatientUpdateInput {
  full_name?: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  address?: string;
  mrn?: string;
  allergies?: string[];
  emergency_contact?: string;
  insurance_info?: any;
}

export class PatientProfileService extends BaseService {
  private validatePatientInput(data: PatientCreateInput | PatientUpdateInput, isCreate: boolean = false): void {
    if (isCreate) {
      const createData = data as PatientCreateInput;
      if (!createData.full_name || typeof createData.full_name !== 'string' || createData.full_name.trim().length === 0) {
        throw new ValidationError('Full name is required and must be a non-empty string');
      }
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (data.date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(data.date_of_birth)) {
      throw new ValidationError('Date of birth must be in YYYY-MM-DD format');
    }

    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      throw new ValidationError('Invalid phone number format');
    }
  }

  async createPatient(patientData: PatientCreateInput): Promise<ServiceResponse<Patient>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('update:own_profile', context)) {
        throw new AuthorizationError('Insufficient permissions to create patient profile');
      }

      this.validatePatientInput(patientData, true);
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

      this.validatePatientInput(patientData, false);

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

export const patientProfileService = new PatientProfileService();
