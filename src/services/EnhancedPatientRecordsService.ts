
import { patientProfileService } from './patient/PatientProfileService';
import { recordSharingService } from './patient/RecordSharingService';

// Re-export services for backwards compatibility
export class EnhancedPatientRecordsService {
  static createOrUpdatePatient = patientProfileService.createOrUpdatePatient.bind(patientProfileService);
  static getCurrentPatient = patientProfileService.getCurrentPatient.bind(patientProfileService);
  static getPatient = patientProfileService.getPatient.bind(patientProfileService);
  static shareRecordWithProvider = recordSharingService.shareRecordWithProvider.bind(recordSharingService);
  static getSharingPermissions = recordSharingService.getSharingPermissions.bind(recordSharingService);
  static revokeSharingPermission = recordSharingService.revokeSharingPermission.bind(recordSharingService);
}

export const enhancedPatientRecordsService = new EnhancedPatientRecordsService();
