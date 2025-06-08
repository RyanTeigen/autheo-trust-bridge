
import { useState, useEffect } from 'react';
import FitnessAuditService, { 
  FitnessAuditLogEntry, 
  FitnessConsentRecord, 
  FitnessAccessPermission 
} from '@/services/fitness/FitnessAuditService';

export const useFitnessAudit = () => {
  const [auditLogs, setAuditLogs] = useState<FitnessAuditLogEntry[]>([]);
  const [consentRecords, setConsentRecords] = useState<FitnessConsentRecord[]>([]);
  const [accessPermissions, setAccessPermissions] = useState<FitnessAccessPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auditService = FitnessAuditService.getInstance();

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [logs, consents, permissions] = await Promise.all([
        auditService.getFitnessAuditLogs(),
        auditService.getConsentRecords(),
        auditService.getAccessPermissions()
      ]);

      setAuditLogs(logs);
      setConsentRecords(consents);
      setAccessPermissions(permissions);
    } catch (err) {
      console.error('Error fetching audit data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const logDataAccess = async (
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any
  ) => {
    try {
      await auditService.logFitnessDataAccess(action, resourceType, resourceId, details);
      // Refresh audit logs after logging
      await fetchAuditData();
    } catch (err) {
      console.error('Error logging data access:', err);
    }
  };

  const recordConsent = async (
    consentType: 'data_collection' | 'data_sharing' | 'research_participation' | 'marketing' | 'third_party_access',
    consentStatus: boolean,
    consentText: string
  ) => {
    try {
      await auditService.recordConsent(consentType, consentStatus, consentText);
      // Refresh data after recording consent
      await fetchAuditData();
    } catch (err) {
      console.error('Error recording consent:', err);
      throw err;
    }
  };

  const grantAccessPermission = async (
    grantedTo: { userId?: string; organization?: string },
    permissionType: 'read' | 'write' | 'delete' | 'share' | 'research',
    dataCategories: string[],
    purpose: string,
    expiresAt?: string
  ) => {
    try {
      await auditService.grantAccessPermission(
        grantedTo,
        permissionType,
        dataCategories,
        purpose,
        expiresAt
      );
      // Refresh data after granting permission
      await fetchAuditData();
    } catch (err) {
      console.error('Error granting access permission:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  return {
    auditLogs,
    consentRecords,
    accessPermissions,
    loading,
    error,
    logDataAccess,
    recordConsent,
    grantAccessPermission,
    refetch: fetchAuditData
  };
};
