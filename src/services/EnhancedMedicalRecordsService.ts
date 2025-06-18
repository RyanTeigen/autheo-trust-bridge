
import { MedicalRecordsCRUD } from './medical/MedicalRecordsCRUD';
import { MedicalRecordsQuery } from './medical/MedicalRecordsQuery';
import { MedicalRecordCreateInput, MedicalRecordUpdateInput } from './medical/MedicalRecordsValidation';

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface RecordFilters {
  recordType?: string;
}

export class EnhancedMedicalRecordsService {
  private crud = new MedicalRecordsCRUD();
  private query = new MedicalRecordsQuery();

  async createRecord(data: MedicalRecordCreateInput, recordType: string = 'general') {
    return this.crud.createRecord(data, recordType);
  }

  async getRecords(options: PaginationOptions = {}, filters: RecordFilters = {}) {
    return this.query.getRecords(options, filters);
  }

  async getRecord(id: string) {
    return this.crud.getRecord(id);
  }

  async updateRecord(id: string, data: MedicalRecordUpdateInput) {
    return this.crud.updateRecord(id, data);
  }

  async deleteRecord(id: string) {
    return this.crud.deleteRecord(id);
  }
}

export const enhancedMedicalRecordsService = new EnhancedMedicalRecordsService();
