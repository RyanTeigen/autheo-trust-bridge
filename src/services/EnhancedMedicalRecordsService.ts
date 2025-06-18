
import { BaseService, ServiceResponse } from './BaseService';
import { PatientRecordsService } from './PatientRecordsService';
import { MedicalRecord, DecryptedMedicalRecord } from '@/types/medical';
import { ValidationError, AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { sanitizeInput } from '@/utils/security';

// Simple encryption functions for medical records
const ENCRYPTION_KEY = 'medical-records-key-2024'; // In production, use proper key management

function encrypt(text: string): string {
  // Simple XOR encryption for demo purposes
  // In production, use proper encryption like AES
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return btoa(result); // Base64 encode
}

function decrypt(encryptedText: string): string {
  try {
    const decoded = atob(encryptedText); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

export class EnhancedMedicalRecordsService extends BaseService {
  async createRecord(data: any, recordType: string = 'general'): Promise<ServiceResponse<{ id: string }>> {
    try {
      // Validate authentication
      const context = await this.validateAuthentication();
      
      // Validate and sanitize input
      if (!data) {
        throw new ValidationError('Record data is required');
      }
      
      const sanitizedData = sanitizeInput(data);
      const sanitizedRecordType = sanitizeInput(recordType);
      
      // Validate user has permission to create records
      if (!await this.validatePermission('create:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to create medical records');
      }

      // Ensure patient record exists
      const patientResult = await PatientRecordsService.getCurrentPatient();
      if (!patientResult.success) {
        return this.createErrorResponse('Failed to get patient record', 400);
      }

      let patientId: string;
      if (!patientResult.patient) {
        // Create patient record if it doesn't exist
        const createResult = await PatientRecordsService.createOrUpdatePatient({});
        if (!createResult.success || !createResult.patient) {
          return this.createErrorResponse('Failed to create patient record', 500);
        }
        patientId = createResult.patient.id;
      } else {
        patientId = patientResult.patient.id;
      }

      // Validate ownership
      if (!await this.validateOwnership(patientId, context)) {
        throw new AuthorizationError('Cannot create records for other patients');
      }

      // Encrypt the data before storing
      const encryptedData = encrypt(JSON.stringify(sanitizedData));

      const { data: record, error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patientId,
          encrypted_data: encryptedData,
          record_type: sanitizedRecordType
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'createRecord');
      }

      return this.createSuccessResponse({ id: record.id }, { 
        operation: 'createRecord',
        recordType: sanitizedRecordType 
      });
    } catch (error) {
      return this.handleError(error, 'createRecord');
    }
  }

  async getRecords(): Promise<ServiceResponse<DecryptedMedicalRecord[]>> {
    try {
      // Validate authentication
      const context = await this.validateAuthentication();
      
      // Validate user has permission to read their own data
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read medical records');
      }

      const result = await PatientRecordsService.getPatientMedicalRecords();
      if (!result.success || !result.records) {
        return this.createErrorResponse(result.error || 'Failed to fetch records', 404);
      }

      // Decrypt the records
      const decryptedRecords: DecryptedMedicalRecord[] = result.records.map(record => {
        try {
          const decryptedData = decrypt(record.encrypted_data);
          return {
            id: record.id,
            patient_id: record.patient_id,
            data: JSON.parse(decryptedData),
            record_type: record.record_type || 'general',
            created_at: record.created_at,
            updated_at: record.updated_at
          };
        } catch (decryptError) {
          console.error('Error decrypting record:', decryptError);
          return {
            id: record.id,
            patient_id: record.patient_id,
            data: { error: 'Failed to decrypt record' },
            record_type: record.record_type || 'general',
            created_at: record.created_at,
            updated_at: record.updated_at
          };
        }
      });

      return this.createSuccessResponse(decryptedRecords, {
        operation: 'getRecords',
        count: decryptedRecords.length
      });
    } catch (error) {
      return this.handleError(error, 'getRecords');
    }
  }

  async getRecord(id: string): Promise<ServiceResponse<DecryptedMedicalRecord>> {
    try {
      // Validate authentication
      const context = await this.validateAuthentication();
      
      // Validate input
      if (!id) {
        throw new ValidationError('Record ID is required');
      }

      const sanitizedId = sanitizeInput(id);

      // First check if record exists and get its owner
      const { data: record, error } = await supabase
        .from('medical_records')
        .select('*, patients!inner(user_id)')
        .eq('id', sanitizedId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Medical record');
        }
        return this.handleError(error, 'getRecord');
      }

      // Validate ownership or permission
      const recordOwnerId = (record as any).patients.user_id;
      const hasOwnership = await this.validateOwnership(recordOwnerId, context);
      const hasReadPermission = await this.validatePermission('read:patient_data', context);

      if (!hasOwnership && !hasReadPermission) {
        throw new AuthorizationError('Insufficient permissions to access this record');
      }

      // Decrypt the record
      try {
        const decryptedData = decrypt(record.encrypted_data);
        const decryptedRecord: DecryptedMedicalRecord = {
          id: record.id,
          patient_id: record.patient_id,
          data: JSON.parse(decryptedData),
          record_type: record.record_type || 'general',
          created_at: record.created_at,
          updated_at: record.updated_at
        };

        return this.createSuccessResponse(decryptedRecord, {
          operation: 'getRecord',
          hasOwnership,
          hasReadPermission
        });
      } catch (decryptError) {
        console.error('Error decrypting record:', decryptError);
        return this.createErrorResponse('Failed to decrypt record', 500);
      }
    } catch (error) {
      return this.handleError(error, 'getRecord');
    }
  }

  async updateRecord(id: string, data: any): Promise<ServiceResponse<void>> {
    try {
      // Validate authentication
      const context = await this.validateAuthentication();
      
      // Validate input
      if (!id || !data) {
        throw new ValidationError('Record ID and data are required');
      }

      const sanitizedId = sanitizeInput(id);
      const sanitizedData = sanitizeInput(data);

      // First check if record exists and get its owner
      const { data: record, error: fetchError } = await supabase
        .from('medical_records')
        .select('*, patients!inner(user_id)')
        .eq('id', sanitizedId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new NotFoundError('Medical record');
        }
        return this.handleError(fetchError, 'updateRecord');
      }

      // Validate ownership or permission
      const recordOwnerId = (record as any).patients.user_id;
      const hasOwnership = await this.validateOwnership(recordOwnerId, context);
      const hasWritePermission = await this.validatePermission('update:patient_data', context);

      if (!hasOwnership && !hasWritePermission) {
        throw new AuthorizationError('Insufficient permissions to update this record');
      }

      // Encrypt the updated data
      const encryptedData = encrypt(JSON.stringify(sanitizedData));

      const { error } = await supabase
        .from('medical_records')
        .update({
          encrypted_data: encryptedData
        })
        .eq('id', sanitizedId);

      if (error) {
        return this.handleError(error, 'updateRecord');
      }

      return this.createSuccessResponse(undefined, {
        operation: 'updateRecord',
        hasOwnership,
        hasWritePermission
      });
    } catch (error) {
      return this.handleError(error, 'updateRecord');
    }
  }

  async deleteRecord(id: string): Promise<ServiceResponse<void>> {
    try {
      // Validate authentication
      const context = await this.validateAuthentication();
      
      // Validate input
      if (!id) {
        throw new ValidationError('Record ID is required');
      }

      const sanitizedId = sanitizeInput(id);

      // First check if record exists and get its owner
      const { data: record, error: fetchError } = await supabase
        .from('medical_records')
        .select('*, patients!inner(user_id)')
        .eq('id', sanitizedId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new NotFoundError('Medical record');
        }
        return this.handleError(fetchError, 'deleteRecord');
      }

      // Validate ownership (only owners can delete their own records)
      const recordOwnerId = (record as any).patients.user_id;
      if (!await this.validateOwnership(recordOwnerId, context)) {
        throw new AuthorizationError('Only record owners can delete their records');
      }

      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', sanitizedId);

      if (error) {
        return this.handleError(error, 'deleteRecord');
      }

      return this.createSuccessResponse(undefined, {
        operation: 'deleteRecord'
      });
    } catch (error) {
      return this.handleError(error, 'deleteRecord');
    }
  }
}

export const enhancedMedicalRecordsService = new EnhancedMedicalRecordsService();
