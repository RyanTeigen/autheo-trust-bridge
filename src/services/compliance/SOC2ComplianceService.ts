// SOC2 Compliance Service - Phase 2: SOC2 Trust Services Criteria
import { supabase } from '@/integrations/supabase/client';

export interface SOC2Control {
  id: string;
  category: 'CC' | 'A' | 'PI' | 'P' | 'C'; // Common Criteria, Availability, Processing Integrity, Privacy, Confidentiality
  title: string;
  description: string;
  status: 'implemented' | 'in_progress' | 'not_implemented' | 'not_applicable';
  evidenceRequired: string[];
  lastReviewed?: Date;
  nextReviewDate?: Date;
  assignedTo?: string;
  implementation: {
    automated: boolean;
    manualSteps: string[];
    frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  };
}

export interface AccessControlEvent {
  userId: string;
  action: 'login' | 'logout' | 'access_granted' | 'access_denied' | 'role_change' | 'permission_change';
  resource?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  riskLevel: 'low' | 'medium' | 'high';
  details: Record<string, any>;
}

export interface ComplianceMetrics {
  controlsImplemented: number;
  controlsTotal: number;
  complianceScore: number;
  lastAssessment: Date;
  nextAssessment: Date;
  criticalGaps: string[];
  incidentCount: {
    last30Days: number;
    last90Days: number;
    lastYear: number;
  };
  auditReadiness: 'ready' | 'needs_work' | 'not_ready';
}

class SOC2ComplianceService {
  private static instance: SOC2ComplianceService;
  private controls: Map<string, SOC2Control>;

  private constructor() {
    this.controls = new Map();
    this.initializeSOC2Controls();
  }

  public static getInstance(): SOC2ComplianceService {
    if (!SOC2ComplianceService.instance) {
      SOC2ComplianceService.instance = new SOC2ComplianceService();
    }
    return SOC2ComplianceService.instance;
  }

  private initializeSOC2Controls(): void {
    const controls: SOC2Control[] = [
      // Common Criteria (CC) - Security
      {
        id: 'CC1.1',
        category: 'CC',
        title: 'Entity demonstrates commitment to integrity and ethical values',
        description: 'The entity demonstrates a commitment to integrity and ethical values through policies, procedures, and actions.',
        status: 'implemented',
        evidenceRequired: ['Code of conduct', 'Security policies', 'Training records'],
        implementation: {
          automated: false,
          manualSteps: ['Regular ethics training', 'Policy reviews', 'Incident reporting'],
          frequency: 'quarterly'
        }
      },
      {
        id: 'CC2.1',
        category: 'CC',
        title: 'Management establishes a risk management program',
        description: 'Management establishes risk assessment and risk management processes.',
        status: 'in_progress',
        evidenceRequired: ['Risk assessment documentation', 'Risk management procedures'],
        implementation: {
          automated: true,
          manualSteps: ['Quarterly risk assessments', 'Risk mitigation planning'],
          frequency: 'quarterly'
        }
      },
      {
        id: 'CC3.1',
        category: 'CC',
        title: 'Management establishes risk tolerance levels',
        description: 'Management establishes the expected behavior related to the design, implementation, and operation of controls.',
        status: 'implemented',
        evidenceRequired: ['Risk tolerance documentation', 'Control effectiveness metrics'],
        implementation: {
          automated: true,
          manualSteps: ['Risk tolerance reviews'],
          frequency: 'annually'
        }
      },
      {
        id: 'CC5.1',
        category: 'CC',
        title: 'Control activities support the achievement of objectives',
        description: 'Management selects and develops control activities that contribute to the mitigation of risks.',
        status: 'implemented',
        evidenceRequired: ['Control documentation', 'Control testing results'],
        implementation: {
          automated: true,
          manualSteps: ['Control testing', 'Control documentation updates'],
          frequency: 'quarterly'
        }
      },
      {
        id: 'CC6.1',
        category: 'CC',
        title: 'Management establishes and operates monitoring activities',
        description: 'Management establishes and operates monitoring activities to monitor the system.',
        status: 'implemented',
        evidenceRequired: ['Monitoring logs', 'Alert configurations', 'Incident reports'],
        implementation: {
          automated: true,
          manualSteps: ['Monitor review', 'Alert tuning'],
          frequency: 'continuous'
        }
      },

      // Availability (A)
      {
        id: 'A1.1',
        category: 'A',
        title: 'Environmental protections',
        description: 'Environmental protections, software, data backup processes, and recovery infrastructure are authorized, designed, developed, implemented, operated, maintained, and monitored.',
        status: 'implemented',
        evidenceRequired: ['Backup procedures', 'Recovery testing', 'Infrastructure monitoring'],
        implementation: {
          automated: true,
          manualSteps: ['Disaster recovery testing', 'Backup verification'],
          frequency: 'monthly'
        }
      },

      // Processing Integrity (PI)
      {
        id: 'PI1.1',
        category: 'PI',
        title: 'Data processing integrity',
        description: 'Inputs are authorized and completely and accurately processed to produce outputs.',
        status: 'implemented',
        evidenceRequired: ['Data validation controls', 'Processing logs', 'Error handling procedures'],
        implementation: {
          automated: true,
          manualSteps: ['Data integrity testing', 'Processing validation'],
          frequency: 'continuous'
        }
      },

      // Privacy (P)
      {
        id: 'P1.1',
        category: 'P',
        title: 'Personal information is collected consistent with objectives',
        description: 'Personal information is collected, used, retained, disclosed, and disposed of in conformity with commitments.',
        status: 'implemented',
        evidenceRequired: ['Privacy policy', 'Consent records', 'Data retention schedules'],
        implementation: {
          automated: false,
          manualSteps: ['Privacy impact assessments', 'Consent management'],
          frequency: 'quarterly'
        }
      },

      // Confidentiality (C)
      {
        id: 'C1.1',
        category: 'C',
        title: 'Information designated as confidential is protected',
        description: 'Information designated as confidential is protected through logical and physical access controls.',
        status: 'implemented',
        evidenceRequired: ['Access control logs', 'Encryption status', 'Data classification'],
        implementation: {
          automated: true,
          manualSteps: ['Access reviews', 'Encryption key management'],
          frequency: 'monthly'
        }
      }
    ];

    controls.forEach(control => {
      this.controls.set(control.id, control);
    });
  }

  public async logAccessControlEvent(event: Omit<AccessControlEvent, 'timestamp'>): Promise<void> {
    const fullEvent: AccessControlEvent = {
      ...event,
      timestamp: new Date()
    };

    try {
      // Store in audit logs for SOC2 compliance
      await supabase.from('audit_logs').insert({
        user_id: event.userId,
        action: `ACCESS_CONTROL_${event.action.toUpperCase()}`,
        resource: event.resource || 'system',
        status: 'success',
        details: `Access control event: ${event.action}`,
        metadata: {
          access_control_event: true,
          action: event.action,
          resource: event.resource,
          risk_level: event.riskLevel,
          details: event.details,
          ip_address: event.ipAddress,
          user_agent: event.userAgent
        },
        phi_accessed: event.resource?.includes('medical') || false
      });

      // If high risk, create additional monitoring
      if (event.riskLevel === 'high') {
        await this.createSecurityAlert(fullEvent);
      }
    } catch (error) {
      console.error('Failed to log access control event:', error);
    }
  }

  private async createSecurityAlert(event: AccessControlEvent): Promise<void> {
    try {
      await supabase.from('breach_detection_events').insert({
        user_id: event.userId,
        event_type: 'suspicious_activity',
        severity: 'high',
        description: `High-risk access control event: ${event.action}`,
        metadata: {
          action: event.action,
          resource: event.resource,
          risk_level: event.riskLevel,
          timestamp: event.timestamp.toISOString(),
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          auto_detected: true
        }
      });
    } catch (error) {
      console.error('Failed to create security alert:', error);
    }
  }

  public async getComplianceMetrics(): Promise<ComplianceMetrics> {
    try {
      const totalControls = this.controls.size;
      const implementedControls = Array.from(this.controls.values())
        .filter(control => control.status === 'implemented').length;

      // Get incident counts
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const [incidents30, incidents90, incidentsYear] = await Promise.all([
        supabase.from('breach_detection_events')
          .select('id')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('breach_detection_events')
          .select('id')
          .gte('created_at', ninetyDaysAgo.toISOString()),
        supabase.from('breach_detection_events')
          .select('id')
          .gte('created_at', oneYearAgo.toISOString())
      ]);

      const complianceScore = (implementedControls / totalControls) * 100;
      const criticalGaps = Array.from(this.controls.values())
        .filter(control => control.status === 'not_implemented' && 
                          (control.category === 'CC' || control.id.includes('1.1')))
        .map(control => control.title);

      let auditReadiness: 'ready' | 'needs_work' | 'not_ready' = 'ready';
      if (complianceScore < 80) auditReadiness = 'not_ready';
      else if (complianceScore < 95) auditReadiness = 'needs_work';

      return {
        controlsImplemented: implementedControls,
        controlsTotal: totalControls,
        complianceScore,
        lastAssessment: new Date(), // In real implementation, track actual assessment dates
        nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        criticalGaps,
        incidentCount: {
          last30Days: incidents30.data?.length || 0,
          last90Days: incidents90.data?.length || 0,
          lastYear: incidentsYear.data?.length || 0
        },
        auditReadiness
      };
    } catch (error) {
      console.error('Failed to get compliance metrics:', error);
      throw error;
    }
  }

  public getControlById(controlId: string): SOC2Control | undefined {
    return this.controls.get(controlId);
  }

  public getControlsByCategory(category: SOC2Control['category']): SOC2Control[] {
    return Array.from(this.controls.values())
      .filter(control => control.category === category);
  }

  public getAllControls(): SOC2Control[] {
    return Array.from(this.controls.values());
  }

  public async updateControlStatus(controlId: string, status: SOC2Control['status'], evidence?: string[]): Promise<void> {
    const control = this.controls.get(controlId);
    if (!control) {
      throw new Error(`Control ${controlId} not found`);
    }

    control.status = status;
    control.lastReviewed = new Date();
    
    if (evidence) {
      control.evidenceRequired = evidence;
    }

    // Log the control update for audit trail
    try {
      await supabase.from('audit_logs').insert({
        action: 'UPDATE_SOC2_CONTROL',
        resource: 'soc2_controls',
        resource_id: controlId,
        status: 'success',
        details: `SOC2 control ${controlId} status updated to ${status}`,
        metadata: {
          control_id: controlId,
          new_status: status,
          evidence: evidence
        }
      });
    } catch (error) {
      console.error('Failed to log control update:', error);
    }
  }

  public async generateComplianceReport(): Promise<{
    summary: ComplianceMetrics;
    controlDetails: SOC2Control[];
    recommendations: string[];
  }> {
    const summary = await this.getComplianceMetrics();
    const controlDetails = this.getAllControls();
    
    const recommendations: string[] = [];
    
    // Generate recommendations based on control status
    const notImplemented = controlDetails.filter(c => c.status === 'not_implemented');
    const inProgress = controlDetails.filter(c => c.status === 'in_progress');
    
    if (notImplemented.length > 0) {
      recommendations.push(`Implement ${notImplemented.length} remaining controls`);
    }
    
    if (inProgress.length > 0) {
      recommendations.push(`Complete ${inProgress.length} controls in progress`);
    }
    
    if (summary.incidentCount.last30Days > 5) {
      recommendations.push('Review and improve incident response procedures');
    }
    
    if (summary.complianceScore < 95) {
      recommendations.push('Focus on achieving 95%+ compliance score for audit readiness');
    }

    return {
      summary,
      controlDetails,
      recommendations
    };
  }

  // Data protection methods for SOC2 compliance
  public async encryptSensitiveData(data: string, context: string): Promise<string> {
    try {
      // Use existing encryption service
      const { encryptWithSecureKey } = await import('@/utils/crypto/SecureExport');
      const encrypted = await encryptWithSecureKey(data);
      
      // Log data protection event
      await supabase.from('audit_logs').insert({
        action: 'ENCRYPT_SENSITIVE_DATA',
        resource: 'data_protection',
        status: 'success',
        details: `Sensitive data encrypted for context: ${context}`,
        metadata: {
          context,
          encryption_used: true
        }
      });
      
      return encrypted;
    } catch (error) {
      console.error('Failed to encrypt sensitive data:', error);
      throw error;
    }
  }

  public async validateDataRetention(): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check for old audit logs that should be archived
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: oldLogs } = await supabase
        .from('audit_logs')
        .select('id')
        .lt('timestamp', sixMonthsAgo.toISOString())
        .limit(1);

      if (oldLogs && oldLogs.length > 0) {
        issues.push('Audit logs older than 6 months found');
        recommendations.push('Archive or purge old audit logs according to retention policy');
      }

      // Check for expired sharing permissions
      const { data: expiredPermissions } = await supabase
        .from('sharing_permissions')
        .select('id')
        .lt('expires_at', new Date().toISOString())
        .eq('status', 'approved');

      if (expiredPermissions && expiredPermissions.length > 0) {
        issues.push(`${expiredPermissions.length} expired sharing permissions still active`);
        recommendations.push('Revoke expired sharing permissions');
      }

      return {
        compliant: issues.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      console.error('Failed to validate data retention:', error);
      return {
        compliant: false,
        issues: ['Failed to perform data retention validation'],
        recommendations: ['Fix data retention validation process']
      };
    }
  }
}

export const soc2Compliance = SOC2ComplianceService.getInstance();
export default SOC2ComplianceService;