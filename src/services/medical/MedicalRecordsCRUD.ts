
import { BaseService, ServiceResponse } from '../BaseService';
import { DecryptedMedicalRecord } from '@/types/medical';
import { ValidationError, AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { MedicalRecordsValidator } from '../validators/MedicalRecordsValidator';
import { MedicalRecordsRepository } from '../repositories/MedicalRecordsRepository';
import { MedicalRecordsValidation, MedicalRecordCreateInput, MedicalRecordUpdateInput } from './MedicalRecordsValidation';
import { MedicalRecordsEncryption } from './MedicalRecordsEncryption';
import { MedicalRecordsPatientService } from './MedicalRecordsPatientService';
import { decrypt } from '../encryption/MedicalRecordsEncryption';

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface RecordFilters {
  recordType?: string;
}

export class MedicalRecordsCRUD extends BaseService {
  async createRecord(
    data: MedicalRecordCreateInput, 
    recordType: string = 'general'
  ): Promise<ServiceResponse<{ id: string }>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('create:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to create medical records');
      }

      MedicalRecordsValidation.validateRecordInput(data, true);

      const { sanitizedData, sanitizedRecordType } = MedicalRecordsValidator.validateCreateInput(data, recordType);
      
      const patientId = await MedicalRecordsPatientService.ensurePatientExists(context);
      
      if (!await this.validateOwnership(patientId, context)) {
        throw new AuthorizationError('Cannot create records for other patients');
      }

      const encryptedData = await MedicalRecordsEncryption.encryptRecordData(sanitizedData);
      const result = await MedicalRecordsRepository.create(patientId, encryptedData, sanitizedRecordType);

      return this.createSuccessResponse(result, { 
        operation: 'createRecord',
        recordType: sanitizedRecordType 
      });
    } catch (error) {
      return this.handleError(error, 'createRecord');
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

      const decryptedRecord = await MedicalRecordsEncryption.decryptSingleRecord(record);

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

  async updateRecord(id: string, data: MedicalRecordUpdateInput): Promise<ServiceResponse<DecryptedMedicalRecord>> {
    try {
      const context = await this.validateAuthentication();
      const sanitizedId = MedicalRecordsValidator.validateId(id);

      MedicalRecordsValidation.validateRecordInput(data, false);

      // Build dynamic update object
      const updateFields: any = {};
      Object.keys(data).forEach(key => {
        const value = data[key as keyof MedicalRecordUpdateInput];
        if (value !== undefined) {
          updateFields[key] = value;
        }
      });

      if (Object.keys(updateFields).length === 0) {
        throw new ValidationError('No fields to update');
      }

      const record = await MedicalRecordsRepository.findById(sanitizedId);
      
      const recordOwnerId = record.patients.user_id;
      const hasOwnership = await this.validateOwnership(recordOwnerId, context);
      const hasWritePermission = await this.validatePermission('update:patient_data', context);

      if (!hasOwnership && !hasWritePermission) {
        throw new AuthorizationError('Insufficient permissions to update this record');
      }

      // Decrypt current data, merge with updates, then re-encrypt
      const currentData = JSON.parse(decrypt(record.encrypted_data));
      const updatedData = { ...currentData, ...updateFields };
      const encryptedData = await MedicalRecordsEncryption.encryptRecordData(updatedData);
      
      await MedicalRecordsRepository.update(sanitizedId, encryptedData);

      // Return updated record
      const updatedRecord = await MedicalRecordsRepository.findById(sanitizedId);
      const decryptedRecord = await MedicalRecordsEncryption.decryptSingleRecord(updatedRecord);

      return this.createSuccessResponse(decryptedRecord, {
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
}
