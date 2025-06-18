
import { PatientCRUD } from './PatientCRUD';
import { PatientQuery } from './PatientQuery';
import { PatientCreateInput, PatientUpdateInput } from './PatientValidation';

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export class PatientProfileService {
  private crud = new PatientCRUD();
  private query = new PatientQuery();

  async createPatient(patientData: PatientCreateInput) {
    return this.crud.createPatient(patientData);
  }

  async updatePatient(patientId: string, patientData: PatientUpdateInput) {
    return this.crud.updatePatient(patientId, patientData);
  }

  async getPatients(options: PaginationOptions = {}) {
    return this.query.getPatients(options);
  }

  async getCurrentPatient() {
    return this.query.getCurrentPatient();
  }

  async getPatient(patientId: string) {
    return this.query.getPatient(patientId);
  }

  async deletePatient(patientId: string) {
    return this.crud.deletePatient(patientId);
  }
}

export const patientProfileService = new PatientProfileService();
