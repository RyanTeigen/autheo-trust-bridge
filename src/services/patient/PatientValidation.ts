
import { ValidationError } from '@/utils/errorHandling';

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

export class PatientValidation {
  static validatePatientInput(data: PatientCreateInput | PatientUpdateInput, isCreate: boolean = false): void {
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
}

export type { PatientCreateInput, PatientUpdateInput };
