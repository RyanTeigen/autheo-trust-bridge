
import { BaseService, ServiceResponse, SecurityContext } from './BaseService';
import { PatientRecordsService } from './PatientRecordsService';
import { DecryptedMedicalRecord } from '@/types/medical';
import { AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { encrypt, decrypt } from './encryption/MedicalRecordsEncryption';
import { MedicalRecordsValidator } from './validators/MedicalRecordsValidator';
import { MedicalRecordsRepository } from './repositories/MedicalRecordsRepository';

export class EnhancedMedicalRecordsService extends BaseService {
  async createRecord(data: any, recordType: string = 'general'): Promise<ServiceResponse<{ id: string }>> {
    try {
      const context = await this.validateAuthentication();
      
      const { sanitizedData, sanitizedRecordType } = MedicalRecordsValidator.validateCreateInput(data, recordType);
      
      if (!await this.validatePermission('create:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to create medical records');
      }

      const patientId = await this.ensurePatientExists(context);
      
      if (!await this.validateOwnership(patientId, context)) {
        throw new AuthorizationError('Cannot create records for other patients');
      }

      const encryptedData = encrypt(JSON.stringify(sanitizedData));
      const result = await MedicalRecordsRepository.create(patientId, encryptedData, sanitizedRecordType);

      return this.createSuccessResponse(result, { 
        operation: 'createRecord',
        recordType: sanitizedRecordType 
      });
    } catch (error) {
      return this.handleError(error, 'createRecord');
    }
  }

  async getRecords(): Promise<ServiceResponse<DecryptedMedicalRecord[]>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read medical records');
      }

      const result = await PatientRecordsService.getPatientMedicalRecords();
      if (!result.success || !result.records) {
        return this.createErrorResponse(result.error || 'Failed to fetch records', 404);
      }

      const decryptedRecords = this.decryptRecords(result.records);

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
      const context = await this.validateAuthentication();
      const sanitizedId = MedicalRecordsValidator.validateId(id);

      const record = await MedicalRecordsRepository.findById(sanitizedId);
      
      const recordOwnerId = record.patients.user_id;
      const hasOwnership = await this.validateOwnership(recordOwnerId, context);
      const hasReadPermission = await this.validatePermission('read:patient_data', context);

      if (!hasOwnership && !hasReadPermission) {
        throw new AuthorizationError('Insufficient permissions to access this record');
      }

      const decryptedRecord = this.decryptSingleRecord(record);

      return this.createSuccessResponse(decryptedRecord, {
        operation: 'getRecord',
        hasOwnership,
        hasReadPermission
      });
    } catch (error) {
      if (error.code === 'PGRST116') {
        return this.handleError(new NotFoundError('Medical record'), 'getRecord');
      }
      return this.handleError(error, 'getRecord');
    }
  }

  async updateRecord(id: string, data: any): Promise<ServiceResponse<void>> {
    try {
      const context = await this.validateAuthentication();
      const { sanitizedId, sanitizedData } = MedicalRecordsValidator.validateUpdateInput(id, data);

      const record = await MedicalRecordsRepository.findById(sanitizedId);
      
      const recordOwnerId = record.patients.user_id;
      const hasOwnership = await this.validateOwnership(recordOwnerId, context);
      const hasWritePermission = await this.validatePermission('update:patient_data', context);

      if (!hasOwnership && !hasWritePermission) {
        throw new AuthorizationError('Insufficient permissions to update this record');
      }

      const encryptedData = encrypt(JSON.stringify(sanitizedData));
      await MedicalRecordsRepository.update(sanitizedId, encryptedData);

      return this.createSuccessResponse(undefined, {
        operation: 'updateRecord',
        hasOwnership,
        hasWritePermission
      });
    } catch (error) {
      if (error.code === 'PGRST116') {
        return this.handleError(new NotFoundError('Medical record'), 'updateRecord');
      }
      return this.handleError(error, 'updateRecord');
    }
  }

  async deleteRecord(id: string): Promise<ServiceResponse<void>> {
    try {
      const context = await this.validateAuthentication();
      const sanitizedId = MedicalRecordsValidator.validateId(id);

      const record = await MedicalRecordsRepository.findById(sanitizedId);
      
      const recordOwnerId = record.patients.user_id;
      if (!await this.validateOwnership(recordOwnerId, context)) {
        throw new AuthorizationError('Only record owners can delete their records');
      }

      await MedicalRecordsRepository.delete(sanitizedId);

      return this.createSuccessResponse(undefined, {
        operation: 'deleteRecord'
      });
    } catch (error) {
      if (error.code === 'PGRST116') {
        return this.handleError(new NotFoundError('Medical record'), 'deleteRecord');
      }
      return this.handleError(error, 'deleteRecord');
    }
  }

  private async ensurePatientExists(context: SecurityContext): Promise<string> {
    const patientResult = await PatientRecordsService.getCurrentPatient();
    if (!patientResult.success) {
      throw new Error('Failed to get patient record');
    }

    if (!patientResult.patient) {
      const createResult = await PatientRecordsService.createOrUpdatePatient({});
      if (!createResult.success || !createResult.patient) {
        throw new Error('Failed to create patient record');
      }
      return createResult.patient.id;
    }

    return patientResult.patient.id;
  }

  private decryptRecords(records: any[]): DecryptedMedicalRecord[] {
    return records.map(record => this.decryptSingleRecord(record));
  }

  private decryptSingleRecord(record: any): DecryptedMedicalRecord {
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
  }
}

export const enhancedMedicalRecordsService = new EnhancedMedicalRecordsService();
