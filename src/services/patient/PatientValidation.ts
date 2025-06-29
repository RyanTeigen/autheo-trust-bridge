
import { ValidationError } from '@/utils/errorHandling';

export interface PatientCreateInput {
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  mrn?: string;
  allergies?: string[];
  emergency_contact?: string;
  insurance_info?: any;
}

export interface PatientUpdateInput {
  full_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  mrn?: string;
  allergies?: string[];
  emergency_contact?: string;
  insurance_info?: any;
}

export class PatientValidation {
  static validatePatientInput(data: PatientCreateInput | PatientUpdateInput, isCreate: boolean = false) {
    if (isCreate && !data.full_name) {
      throw new ValidationError('Full name is required');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      throw new ValidationError('Invalid phone format');
    }

    if (data.date_of_birth && !this.isValidDate(data.date_of_birth)) {
      throw new ValidationError('Invalid date of birth');
    }

    if (data.allergies && !Array.isArray(data.allergies)) {
      throw new ValidationError('Allergies must be an array');
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date <= new Date();
  }
}
