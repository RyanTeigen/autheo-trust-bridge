
import { PatientRecordsService } from '../PatientRecordsService';

export class MedicalRecordsPatientService {
  static async ensurePatientExists(context: any): Promise<string> {
    const patientResult = await PatientRecordsService.getCurrentPatient();
    if (!patientResult.success) {
      throw new Error('Failed to get patient record');
    }

    if (!patientResult.data) {
      const createResult = await PatientRecordsService.createOrUpdatePatient({});
      if (!createResult.success || !createResult.data) {
        throw new Error('Failed to create patient record');
      }
      return createResult.data.id;
    }

    return patientResult.data.id;
  }
}
