
import { ValidationError } from '@/utils/errorHandling';

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

export class MedicalRecordsValidation {
  static validateRecordInput(data: MedicalRecordCreateInput | MedicalRecordUpdateInput, isCreate: boolean = false): void {
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
}

export type { MedicalRecordCreateInput, MedicalRecordUpdateInput };
