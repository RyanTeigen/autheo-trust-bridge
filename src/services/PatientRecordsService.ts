
import { EnhancedPatientRecordsService } from './EnhancedPatientRecordsService';

// Legacy service that delegates to the enhanced version
export class PatientRecordsService {
  static createOrUpdatePatient = EnhancedPatientRecordsService.createOrUpdatePatient;
  static getCurrentPatient = EnhancedPatientRecordsService.getCurrentPatient;
  static getPatient = EnhancedPatientRecordsService.getPatient;
  static shareRecordWithProvider = EnhancedPatientRecordsService.shareRecordWithProvider;
  static getSharingPermissions = EnhancedPatientRecordsService.getSharingPermissions;
  static revokeSharingPermission = EnhancedPatientRecordsService.revokeSharingPermission;

  // Properly implemented method to fetch patient medical records
  static async getPatientMedicalRecords() {
    try {
      const patientResult = await this.getCurrentPatient();
      if (!patientResult.success || !patientResult.data) {
        return { success: false, error: 'Patient record not found' };
      }

      // Import the enhanced medical records service for proper record retrieval
      const { enhancedMedicalRecordsService } = await import('./EnhancedMedicalRecordsService');
      
      // Get medical records for the current patient
      const recordsResult = await enhancedMedicalRecordsService.getRecords(
        { limit: 50, offset: 0 }, 
        {}
      );

      if (recordsResult.success) {
        return {
          success: true,
          records: recordsResult.data?.records || [],
          totalCount: recordsResult.data?.totalCount || 0
        };
      } else {
        return { 
          success: false, 
          error: recordsResult.error || 'Failed to fetch medical records' 
        };
      }
    } catch (error) {
      console.error('Error fetching patient medical records:', error);
      return { 
        success: false, 
        error: 'Failed to fetch patient medical records' 
      };
    }
  }
}
