import { BaseService, ServiceResponse } from './BaseService';
import { PatientRecordsService } from './PatientRecordsService';
import { DecryptedMedicalRecord } from '@/types/medical';
import { ValidationError, AuthorizationError, NotFoundError } from '@/utils/errorHandling';
import { encrypt, decrypt } from './encryption/MedicalRecordsEncryption';
import { MedicalRecordsValidator } from './validators/MedicalRecordsValidator';
import { MedicalRecordsRepository } from './repositories/MedicalRecordsRepository';

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface RecordFilters {
  recordType?: string;
}

interface MedicalRecordCreateInput {
  title: string;
  description?: string;
  category?: string;
  notes?: string;
  [key: string]: any;
}

interface MedicalRecordUpdateInput {
  title?: string;
  description?: string;
  category?: string;
  notes?: string;
  [key: string]: any;
}

export class EnhancedMedicalRecordsService extends BaseService {
  private validateRecordInput(data: MedicalRecordCreateInput | MedicalRecordUpdateInput, isCreate: boolean = false): void {
    if (isCreate) {
      const createData = data as MedicalRecordCreateInput;
      if (!createData.title || typeof createData.title !== 'string' || createData.title.trim().length === 0) {
        throw new ValidationError('Title is required and must be a non-empty string');
      }
    }

    if (data.title && (typeof data.title !== 'string' || data.title.trim().length === 0)) {
      throw new ValidationError('Title must be a non-empty string');
    }

    if (data.description && typeof data.description !== 'string') {
      throw new ValidationError('Description must be a string');
    }

    if (data.category && typeof data.category !== 'string') {
      throw new ValidationError('Category must be a string');
    }

    if (data.notes && typeof data.notes !== 'string') {
      throw new ValidationError('Notes must be a string');
    }
  }

  async createRecord(
    data: MedicalRecordCreateInput, 
    recordType: string = 'general'
  ): Promise<ServiceResponse<{ id: string }>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('create:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to create medical records');
      }

      this.validateRecordInput(data, true);

      const { sanitizedData, sanitizedRecordType } = MedicalRecordsValidator.validateCreateInput(data, recordType);
      
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

  async getRecords(
    options: PaginationOptions = {},
    filters: RecordFilters = {}
  ): Promise<ServiceResponse<{ records: DecryptedMedicalRecord[]; totalCount: number; pagination: any }>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read medical records');
      }

      const patientResult = await PatientRecordsService.getCurrentPatient();
      if (!patientResult.success || !patientResult.patient) {
        return this.createErrorResponse('Patient record not found', 404);
      }

      const limit = Math.min(Math.max(options.limit || 10, 1), 100);
      const offset = Math.max(options.offset || 0, 0);

      const [records, totalCount] = await Promise.all([
        MedicalRecordsRepository.findByPatientId(
          patientResult.patient.id,
          { limit, offset },
          { recordType: filters.recordType }
        ),
        MedicalRecordsRepository.countByPatientId(
          patientResult.patient.id,
          { recordType: filters.recordType }
        )
      ]);

      const decryptedRecords = this.decryptRecords(records);

      return this.createSuccessResponse({
        records: decryptedRecords,
        totalCount,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }, {
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

  async updateRecord(id: string, data: MedicalRecordUpdateInput): Promise<ServiceResponse<DecryptedMedicalRecord>> {
    try {
      const context = await this.validateAuthentication();
      const sanitizedId = MedicalRecordsValidator.validateId(id);

      this.validateRecordInput(data, false);

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
      const encryptedData = encrypt(JSON.stringify(updatedData));
      
      await MedicalRecordsRepository.update(sanitizedId, encryptedData);

      // Return updated record
      const updatedRecord = await MedicalRecordsRepository.findById(sanitizedId);
      const decryptedRecord = this.decryptSingleRecord(updatedRecord);

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

  private async ensurePatientExists(context: any): Promise<string> {
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
