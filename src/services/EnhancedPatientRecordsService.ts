
import { patientProfileService } from './patient/PatientProfileService';
import { recordSharingService } from './patient/RecordSharingService';

// Re-export services for backwards compatibility
export class EnhancedPatientRecordsService {
  static async createOrUpdatePatient(data: any) {
    // Check if patient exists first
    const currentPatientResult = await patientProfileService.getCurrentPatient();
    
    if (currentPatientResult.success && currentPatientResult.data) {
      // Update existing patient
      return await patientProfileService.updatePatient(currentPatientResult.data.id, data);
    } else {
      // Create new patient
      return await patientProfileService.createPatient(data);
    }
  }
  
  static getCurrentPatient = patientProfileService.getCurrentPatient.bind(patientProfileService);
  static getPatient = patientProfileService.getPatient.bind(patientProfileService);
  static shareRecordWithProvider = recordSharingService.shareRecordWithProvider.bind(recordSharingService);
  static getSharingPermissions = recordSharingService.getSharingPermissions.bind(recordSharingService);
  static revokeSharingPermission = recordSharingService.revokeSharingPermission.bind(recordSharingService);
}

// Remove the instance export since we're using static methods
