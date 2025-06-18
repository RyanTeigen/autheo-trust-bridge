
import { ValidationError } from '@/utils/errorHandling';
import { sanitizeInput } from '@/utils/security';

export class MedicalRecordsValidator {
  static validateCreateInput(data: any, recordType: string): { sanitizedData: any; sanitizedRecordType: string } {
    if (!data) {
      throw new ValidationError('Record data is required');
    }
    
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new ValidationError('Title is required and must be a non-empty string');
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
    
    const sanitizedData = sanitizeInput(data);
    const sanitizedRecordType = sanitizeInput(recordType);
    
    // Ensure valid record types
    const validRecordTypes = ['general', 'lab', 'medication', 'visit', 'imaging', 'consultation', 'diagnostic'];
    if (!validRecordTypes.includes(sanitizedRecordType)) {
      throw new ValidationError(`Invalid record type. Must be one of: ${validRecordTypes.join(', ')}`);
    }
    
    return { sanitizedData, sanitizedRecordType };
  }

  static validateUpdateInput(id: string, data: any): { sanitizedId: string; sanitizedData: any } {
    if (!id || !data) {
      throw new ValidationError('Record ID and data are required');
    }

    if (Object.keys(data).length === 0) {
      throw new ValidationError('No fields to update');
    }

    // Validate individual fields if present
    if (data.title !== undefined && (typeof data.title !== 'string' || data.title.trim().length === 0)) {
      throw new ValidationError('Title must be a non-empty string');
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
      throw new ValidationError('Description must be a string');
    }

    if (data.category !== undefined && typeof data.category !== 'string') {
      throw new ValidationError('Category must be a string');
    }

    if (data.notes !== undefined && typeof data.notes !== 'string') {
      throw new ValidationError('Notes must be a string');
    }

    const sanitizedId = sanitizeInput(id);
    const sanitizedData = sanitizeInput(data);

    return { sanitizedId, sanitizedData };
  }

  static validateId(id: string): string {
    if (!id) {
      throw new ValidationError('Record ID is required');
    }

    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationError('Record ID must be a non-empty string');
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValidationError('Record ID must be a valid UUID');
    }

    return sanitizeInput(id);
  }

  static validatePaginationParams(limit?: number, offset?: number): { limit: number; offset: number } {
    const validatedLimit = Math.min(Math.max(limit || 10, 1), 100);
    const validatedOffset = Math.max(offset || 0, 0);

    return { limit: validatedLimit, offset: validatedOffset };
  }

  static validateSortParams(sortBy?: string, sortOrder?: string): { sortBy: string; sortOrder: 'asc' | 'desc' } {
    const validSortFields = ['created_at', 'updated_at', 'title', 'record_type'];
    const validSortBy = validSortFields.includes(sortBy || '') ? sortBy! : 'created_at';
    const validSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    return { sortBy: validSortBy, sortOrder: validSortOrder };
  }
}
