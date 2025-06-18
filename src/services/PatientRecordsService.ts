
import { enhancedPatientRecordsService } from './EnhancedPatientRecordsService';

// Legacy service that delegates to the enhanced version
export class PatientRecordsService {
  static createOrUpdatePatient = enhancedPatientRecordsService.createOrUpdatePatient;
  static getCurrentPatient = enhancedPatientRecordsService.getCurrentPatient;
  static getPatient = enhancedPatientRecordsService.getPatient;
  static shareRecordWithProvider = enhancedPatientRecordsService.shareRecordWithProvider;
  static getSharingPermissions = enhancedPatientRecordsService.getSharingPermissions;
  static revokeSharingPermission = enhancedPatientRecordsService.revokeSharingPermission;
}
