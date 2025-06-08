
import { supabase } from '@/integrations/supabase/client';

export interface FitnessAuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  details?: any;
  status: 'success' | 'failure' | 'warning';
  compliance_category: 'access' | 'disclosure' | 'amendment' | 'breach' | 'administrative';
}

export interface FitnessConsentRecord {
  id: string;
  user_id: string;
  consent_type: 'data_collection' | 'data_sharing' | 'research_participation' | 'marketing' | 'third_party_access';
  consent_status: boolean;
  consent_date: string;
  withdrawal_date?: string;
  consent_version: string;
  consent_text: string;
  ip_address?: string;
  digital_signature?: string;
  witness_signature?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface FitnessAccessPermission {
  id: string;
  user_id: string;
  granted_to_user_id?: string;
  granted_to_organization?: string;
  permission_type: 'read' | 'write' | 'delete' | 'share' | 'research';
  data_categories: string[];
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
  granted_by: string;
  purpose: string;
  conditions?: any;
  status: 'active' | 'expired' | 'revoked' | 'suspended';
  created_at: string;
  updated_at: string;
}

export class FitnessAuditService {
  private static instance: FitnessAuditService;

  public static getInstance(): FitnessAuditService {
    if (!FitnessAuditService.instance) {
      FitnessAuditService.instance = new FitnessAuditService();
    }
    return FitnessAuditService.instance;
  }

  /**
   * Log fitness data access or modifications
   */
  async logFitnessDataAccess(
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any,
    status: 'success' | 'failure' | 'warning' = 'success'
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await (supabase as any)
        .from('fitness_audit_logs')
        .insert({
          user_id: user.user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          status,
          compliance_category: 'access',
          ip_address: this.getClientIP(),
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error logging fitness data access:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to log fitness data access:', error);
      // Don't throw error to prevent breaking main functionality
    }
  }

  /**
   * Log data disclosure events
   */
  async logDataDisclosure(
    recipient: string,
    purpose: string,
    dataCategories: string[],
    details?: any
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await (supabase as any)
        .from('fitness_audit_logs')
        .insert({
          user_id: user.user.id,
          action: `Data disclosed to ${recipient}`,
          resource_type: 'fitness_data_disclosure',
          details: {
            recipient,
            purpose,
            data_categories: dataCategories,
            ...details
          },
          status: 'success',
          compliance_category: 'disclosure',
          ip_address: this.getClientIP(),
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error logging data disclosure:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to log data disclosure:', error);
      throw error;
    }
  }

  /**
   * Record user consent
   */
  async recordConsent(
    consentType: 'data_collection' | 'data_sharing' | 'research_participation' | 'marketing' | 'third_party_access',
    consentStatus: boolean,
    consentText: string,
    consentVersion: string = '1.0'
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await (supabase as any)
        .from('fitness_consent_records')
        .insert({
          user_id: user.user.id,
          consent_type: consentType,
          consent_status: consentStatus,
          consent_text: consentText,
          consent_version: consentVersion,
          ip_address: this.getClientIP()
        });

      if (error) {
        console.error('Error recording consent:', error);
        throw error;
      }

      // Also log this as an audit event
      await this.logFitnessDataAccess(
        `Consent ${consentStatus ? 'granted' : 'withdrawn'} for ${consentType}`,
        'consent_record',
        undefined,
        { consent_type: consentType, consent_status: consentStatus }
      );
    } catch (error) {
      console.error('Failed to record consent:', error);
      throw error;
    }
  }

  /**
   * Grant access permission to another user or organization
   */
  async grantAccessPermission(
    grantedTo: { userId?: string; organization?: string },
    permissionType: 'read' | 'write' | 'delete' | 'share' | 'research',
    dataCategories: string[],
    purpose: string,
    expiresAt?: string,
    conditions?: any
  ): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await (supabase as any)
        .from('fitness_access_permissions')
        .insert({
          user_id: user.user.id,
          granted_to_user_id: grantedTo.userId,
          granted_to_organization: grantedTo.organization,
          permission_type: permissionType,
          data_categories: dataCategories,
          purpose,
          expires_at: expiresAt,
          conditions,
          granted_by: user.user.id
        });

      if (error) {
        console.error('Error granting access permission:', error);
        throw error;
      }

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
    } catch (error) {
      console.error('Failed to grant access permission:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for the current user
   */
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

  /**
   * Get consent records for the current user
   */
  async getConsentRecords(): Promise<FitnessConsentRecord[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await (supabase as any)
        .from('fitness_consent_records')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching consent records:', error);
        throw error;
      }

      return (data || []) as FitnessConsentRecord[];
    } catch (error) {
      console.error('Failed to fetch consent records:', error);
      return [];
    }
  }

  /**
   * Get access permissions for the current user
   */
  async getAccessPermissions(): Promise<FitnessAccessPermission[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await (supabase as any)
        .from('fitness_access_permissions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching access permissions:', error);
        throw error;
      }

      return (data || []) as FitnessAccessPermission[];
    } catch (error) {
      console.error('Failed to fetch access permissions:', error);
      return [];
    }
  }

  private getClientIP(): string {
    // In a real application, you would get this from the server
    // For now, return a placeholder
    return '127.0.0.1';
  }
}

export default FitnessAuditService;
