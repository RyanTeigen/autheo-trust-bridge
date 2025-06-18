
import { ValidationError } from '@/utils/errorHandling';
import { sanitizeInput } from '@/utils/security';

export class MedicalRecordsValidator {
  static validateCreateInput(data: any, recordType: string): { sanitizedData: any; sanitizedRecordType: string } {
    if (!data) {
      throw new ValidationError('Record data is required');
    }
    
    const sanitizedData = sanitizeInput(data);
    const sanitizedRecordType = sanitizeInput(recordType);
    
    return { sanitizedData, sanitizedRecordType };
  }

  static validateUpdateInput(id: string, data: any): { sanitizedId: string; sanitizedData: any } {
    if (!id || !data) {
      throw new ValidationError('Record ID and data are required');
    }

    const sanitizedId = sanitizeInput(id);
    const sanitizedData = sanitizeInput(data);

    return { sanitizedId, sanitizedData };
  }

  static validateId(id: string): string {
    if (!id) {
      throw new ValidationError('Record ID is required');
    }

    return sanitizeInput(id);
  }
}
