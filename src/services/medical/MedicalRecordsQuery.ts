
import { BaseService, ServiceResponse } from '../BaseService';
import { DecryptedRecord } from '@/types/medical';
import { AuthorizationError } from '@/utils/errorHandling';
import { MedicalRecordsRepository } from '../repositories/MedicalRecordsRepository';
import { MedicalRecordsEncryption } from './MedicalRecordsEncryption';
import { PatientRecordsService } from '../PatientRecordsService';

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface RecordFilters {
  recordType?: string;
}

export class MedicalRecordsQuery extends BaseService {
  async getRecords(
    options: PaginationOptions = {},
    filters: RecordFilters = {}
  ): Promise<ServiceResponse<{ records: DecryptedRecord[]; totalCount: number; pagination: any }>> {
    try {
      const context = await this.validateAuthentication();
      
      if (!await this.validatePermission('read:own_data', context)) {
        throw new AuthorizationError('Insufficient permissions to read medical records');
      }

      const patientResult = await PatientRecordsService.getCurrentPatient();
      if (!patientResult.success || !patientResult.data) {
        return this.createErrorResponse('Patient record not found', 404);
      }

      const limit = Math.min(Math.max(options.limit || 10, 1), 100);
      const offset = Math.max(options.offset || 0, 0);

      const [records, totalCount] = await Promise.all([
        MedicalRecordsRepository.findByPatientIdWithPatients(
          patientResult.data.id,
          { limit, offset },
          { recordType: filters.recordType }
        ),
        MedicalRecordsRepository.countByPatientId(
          patientResult.data.id,
          { recordType: filters.recordType }
        )
      ]);

      const decryptedRecords = await MedicalRecordsEncryption.decryptRecords(records);

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
}
