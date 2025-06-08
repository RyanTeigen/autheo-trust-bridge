
import { supabase } from '@/integrations/supabase/client';
import { FitnessAuditLogEntry } from './types';
import { FitnessAuditLogger } from './AuditLogger';
import { FitnessConsentManager } from './ConsentManager';
import { FitnessAccessPermissionManager } from './AccessPermissionManager';

export class FitnessAuditService {
  private static instance: FitnessAuditService;
  private auditLogger: FitnessAuditLogger;
  private consentManager: FitnessConsentManager;
  private accessPermissionManager: FitnessAccessPermissionManager;

  private constructor() {
    this.auditLogger = new FitnessAuditLogger();
    this.consentManager = new FitnessConsentManager();
    this.accessPermissionManager = new FitnessAccessPermissionManager();
  }

  public static getInstance(): FitnessAuditService {
    if (!FitnessAuditService.instance) {
      FitnessAuditService.instance = new FitnessAuditService();
    }
    return FitnessAuditService.instance;
  }

  // Delegate to audit logger
  async logFitnessDataAccess(
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any,
    status: 'success' | 'failure' | 'warning' = 'success'
  ): Promise<void> {
    return this.auditLogger.logFitnessDataAccess(action, resourceType, resourceId, details, status);
  }

  async logDataDisclosure(
    recipient: string,
    purpose: string,
    dataCategories: string[],
    details?: any
  ): Promise<void> {
    return this.auditLogger.logDataDisclosure(recipient, purpose, dataCategories, details);
  }

  // Delegate to consent manager
  async recordConsent(
    consentType: 'data_collection' | 'data_sharing' | 'research_participation' | 'marketing' | 'third_party_access',
    consentStatus: boolean,
    consentText: string,
    consentVersion?: string
  ): Promise<void> {
    await this.consentManager.recordConsent(consentType, consentStatus, consentText, consentVersion);
    
    // Also log this as an audit event
    await this.logFitnessDataAccess(
      `Consent ${consentStatus ? 'granted' : 'withdrawn'} for ${consentType}`,
      'consent_record',
      undefined,
      { consent_type: consentType, consent_status: consentStatus }
    );
  }

  async getConsentRecords() {
    return this.consentManager.getConsentRecords();
  }

  // Delegate to access permission manager
  async grantAccessPermission(
    grantedTo: { userId?: string; organization?: string },
    permissionType: 'read' | 'write' | 'delete' | 'share' | 'research',
    dataCategories: string[],
    purpose: string,
    expiresAt?: string,
    conditions?: any
  ): Promise<void> {
    await this.accessPermissionManager.grantAccessPermission(
      grantedTo,
      permissionType,
      dataCategories,
      purpose,
      expiresAt,
      conditions
    );

    // Log this as an audit event
    await this.logFitnessDataAccess(
      `Access permission granted to ${grantedTo.organization || 'user'}`,
      'access_permission',
      undefined,
      {
        granted_to: grantedTo,
        permission_type: permissionType,
        data_categories: dataCategories,
        purpose
      }
    );
  }

  async getAccessPermissions() {
    return this.accessPermissionManager.getAccessPermissions();
  }

  async getFitnessAuditLogs(limit: number = 50): Promise<FitnessAuditLogEntry[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await (supabase as any)
        .from('fitness_audit_logs')
        .select('*')
        .eq('user_id', user.user.id)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
      }

      return (data || []) as FitnessAuditLogEntry[];
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }
}

export default FitnessAuditService;
export * from './types';
