// PHIPA Compliance Service - Phase 3: Personal Health Information Protection Act
import { supabase } from '@/integrations/supabase/client';

export interface PHIPAControl {
  id: string;
  category: 'administrative' | 'technical' | 'physical';
  requirement: string;
  description: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  evidence: string[];
  lastReviewed?: Date;
  nextReviewDate?: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  implementationDetails: {
    steps: string[];
    responsible: string;
    timeline: string;
  };
}

export interface PHIAccessEvent {
  userId: string;
  patientId: string;
  dataTypes: string[];
  accessPurpose: 'treatment' | 'payment' | 'operations' | 'research' | 'quality_assurance' | 'other';
  justification: string;
  timestamp: Date;
  duration: number; // in minutes
  ipAddress?: string;
  deviceInfo?: string;
}

export interface BreachAssessment {
  id: string;
  incidentId: string;
  description: string;
  affectedPatients: number;
  dataTypes: string[];
  riskLevel: 'low' | 'medium' | 'high';
  reportable: boolean;
  mitigationSteps: string[];
  reportedToAuthorities: boolean;
  reportedAt?: Date;
  status: 'identified' | 'under_review' | 'mitigated' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

class PHIPAComplianceService {
  private static instance: PHIPAComplianceService;
  private controls: Map<string, PHIPAControl>;

  private constructor() {
    this.controls = new Map();
    this.initializePHIPAControls();
  }

  public static getInstance(): PHIPAComplianceService {
    if (!PHIPAComplianceService.instance) {
      PHIPAComplianceService.instance = new PHIPAComplianceService();
    }
    return PHIPAComplianceService.instance;
  }

  private initializePHIPAControls(): void {
    const controls: PHIPAControl[] = [
      // Administrative Safeguards
      {
        id: 'ADM-001',
        category: 'administrative',
        requirement: 'Privacy Officer Assignment',
        description: 'Assign responsibility for developing and implementing privacy policies and procedures.',
        status: 'compliant',
        evidence: ['Privacy officer appointment letter', 'Privacy policies', 'Training records'],
        riskLevel: 'high',
        implementationDetails: {
          steps: ['Appoint privacy officer', 'Define responsibilities', 'Document policies'],
          responsible: 'Executive Team',
          timeline: 'Immediate'
        }
      },
      {
        id: 'ADM-002',
        category: 'administrative',
        requirement: 'Workforce Training',
        description: 'Conduct training of workforce on privacy policies and procedures.',
        status: 'compliant',
        evidence: ['Training materials', 'Attendance records', 'Competency assessments'],
        riskLevel: 'medium',
        implementationDetails: {
          steps: ['Develop training program', 'Conduct regular training', 'Track completion'],
          responsible: 'Privacy Officer',
          timeline: 'Quarterly'
        }
      },
      {
        id: 'ADM-003',
        category: 'administrative',
        requirement: 'Information Access Management',
        description: 'Implement procedures for authorizing access to PHI.',
        status: 'compliant',
        evidence: ['Access control procedures', 'Authorization records', 'Access reviews'],
        riskLevel: 'high',
        implementationDetails: {
          steps: ['Define access criteria', 'Implement authorization process', 'Regular access reviews'],
          responsible: 'IT Security Team',
          timeline: 'Monthly'
        }
      },
      {
        id: 'ADM-004',
        category: 'administrative',
        requirement: 'Incident Response',
        description: 'Establish procedures to address security incidents and breaches.',
        status: 'compliant',
        evidence: ['Incident response plan', 'Incident logs', 'Response procedures'],
        riskLevel: 'critical',
        implementationDetails: {
          steps: ['Develop incident response plan', 'Train response team', 'Test procedures'],
          responsible: 'Security Team',
          timeline: 'Immediate'
        }
      },

      // Technical Safeguards
      {
        id: 'TECH-001',
        category: 'technical',
        requirement: 'Access Control',
        description: 'Implement technical controls to ensure only authorized persons have access to PHI.',
        status: 'compliant',
        evidence: ['Authentication logs', 'Authorization matrix', 'Access control configuration'],
        riskLevel: 'high',
        implementationDetails: {
          steps: ['Configure access controls', 'Implement authentication', 'Monitor access'],
          responsible: 'IT Team',
          timeline: 'Immediate'
        }
      },
      {
        id: 'TECH-002',
        category: 'technical',
        requirement: 'Audit Controls',
        description: 'Implement hardware, software, and procedural mechanisms to record access to PHI.',
        status: 'compliant',
        evidence: ['Audit logs', 'Monitoring systems', 'Log analysis reports'],
        riskLevel: 'high',
        implementationDetails: {
          steps: ['Enable audit logging', 'Configure monitoring', 'Regular log review'],
          responsible: 'IT Security Team',
          timeline: 'Continuous'
        }
      },
      {
        id: 'TECH-003',
        category: 'technical',
        requirement: 'Integrity',
        description: 'Protect PHI from improper alteration or destruction.',
        status: 'compliant',
        evidence: ['Data integrity controls', 'Backup procedures', 'Version control'],
        riskLevel: 'medium',
        implementationDetails: {
          steps: ['Implement integrity controls', 'Configure backups', 'Test recovery'],
          responsible: 'IT Team',
          timeline: 'Weekly'
        }
      },
      {
        id: 'TECH-004',
        category: 'technical',
        requirement: 'Transmission Security',
        description: 'Ensure PHI is protected during transmission over networks.',
        status: 'compliant',
        evidence: ['Encryption configuration', 'Network security policies', 'Transmission logs'],
        riskLevel: 'high',
        implementationDetails: {
          steps: ['Configure encryption', 'Secure network protocols', 'Monitor transmissions'],
          responsible: 'Network Team',
          timeline: 'Continuous'
        }
      },

      // Physical Safeguards
      {
        id: 'PHYS-001',
        category: 'physical',
        requirement: 'Facility Access Controls',
        description: 'Limit physical access to facilities where PHI is stored or processed.',
        status: 'compliant',
        evidence: ['Access control systems', 'Visitor logs', 'Security procedures'],
        riskLevel: 'medium',
        implementationDetails: {
          steps: ['Install access controls', 'Train security personnel', 'Monitor access'],
          responsible: 'Facilities Team',
          timeline: 'Immediate'
        }
      },
      {
        id: 'PHYS-002',
        category: 'physical',
        requirement: 'Workstation Use',
        description: 'Implement policies for workstations that access PHI.',
        status: 'compliant',
        evidence: ['Workstation policies', 'Configuration standards', 'Usage monitoring'],
        riskLevel: 'medium',
        implementationDetails: {
          steps: ['Define workstation policies', 'Configure security settings', 'Monitor usage'],
          responsible: 'IT Team',
          timeline: 'Immediate'
        }
      },
      {
        id: 'PHYS-003',
        category: 'physical',
        requirement: 'Device and Media Controls',
        description: 'Implement controls for hardware and electronic media containing PHI.',
        status: 'compliant',
        evidence: ['Device inventory', 'Disposal procedures', 'Media handling policies'],
        riskLevel: 'medium',
        implementationDetails: {
          steps: ['Inventory devices', 'Secure disposal procedures', 'Media encryption'],
          responsible: 'IT Team',
          timeline: 'Monthly'
        }
      }
    ];

    controls.forEach(control => {
      this.controls.set(control.id, control);
    });
  }

  public async logPHIAccess(event: Omit<PHIAccessEvent, 'timestamp'>): Promise<void> {
    const fullEvent: PHIAccessEvent = {
      ...event,
      timestamp: new Date()
    };

    try {
      // Store PHI access event for PHIPA compliance
      await supabase.from('audit_logs').insert({
        user_id: event.userId,
        action: 'PHI_ACCESS',
        resource: 'phi',
        resource_id: event.patientId,
        status: 'success',
        details: `PHI accessed for ${event.accessPurpose}: ${event.justification}`,
        metadata: {
          phi_access_event: true,
          patient_id: event.patientId,
          data_types: event.dataTypes,
          access_purpose: event.accessPurpose,
          justification: event.justification,
          duration_minutes: event.duration,
          ip_address: event.ipAddress,
          device_info: event.deviceInfo
        },
        phi_accessed: true,
        access_purpose: event.accessPurpose,
        minimum_necessary_justification: event.justification,
        data_categories: event.dataTypes
      });

      // Check for unusual access patterns
      await this.analyzeAccessPattern(fullEvent);
    } catch (error) {
      console.error('Failed to log PHI access:', error);
    }
  }

  private async analyzeAccessPattern(event: PHIAccessEvent): Promise<void> {
    try {
      // Check for excessive access in short time period
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const { data: recentAccess } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('user_id', event.userId)
        .eq('action', 'PHI_ACCESS')
        .gte('timestamp', oneHourAgo.toISOString());

      if (recentAccess && recentAccess.length > 20) {
        await this.reportSuspiciousActivity(event, 'excessive_access', 
          `User accessed PHI ${recentAccess.length} times in the last hour`);
      }

      // Check for after-hours access
      const hour = event.timestamp.getHours();
      if (hour < 6 || hour > 22) {
        await this.reportSuspiciousActivity(event, 'after_hours_access',
          `PHI accessed outside normal business hours (${hour}:00)`);
      }
    } catch (error) {
      console.error('Failed to analyze access pattern:', error);
    }
  }

  private async reportSuspiciousActivity(event: PHIAccessEvent, type: string, description: string): Promise<void> {
    try {
      await supabase.from('breach_detection_events').insert({
        user_id: event.userId,
        event_type: 'suspicious_activity',
        severity: 'medium',
        description: `PHIPA compliance concern: ${description}`,
        metadata: {
          phi_access_event: {
            patient_id: event.patientId,
            access_purpose: event.accessPurpose,
            timestamp: event.timestamp.toISOString()
          },
          activity_type: type,
          auto_detected: true
        }
      });
    } catch (error) {
      console.error('Failed to report suspicious activity:', error);
    }
  }

  public async assessBreachRisk(incidentDescription: string, affectedPatients: number, dataTypes: string[]): Promise<BreachAssessment> {
    const id = crypto.randomUUID();
    const incidentId = `BREACH-${Date.now()}`;
    
    // Calculate risk level based on factors
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let reportable = false;

    if (affectedPatients > 100 || dataTypes.includes('sensitive_medical_info')) {
      riskLevel = 'high';
      reportable = true;
    } else if (affectedPatients > 10 || dataTypes.includes('identifying_info')) {
      riskLevel = 'medium';
      reportable = true;
    }

    const assessment: BreachAssessment = {
      id,
      incidentId,
      description: incidentDescription,
      affectedPatients,
      dataTypes,
      riskLevel,
      reportable,
      mitigationSteps: this.generateMitigationSteps(riskLevel, dataTypes),
      reportedToAuthorities: false,
      status: 'identified',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Store breach assessment
      await supabase.from('audit_logs').insert({
        action: 'BREACH_ASSESSMENT',
        resource: 'phipa_compliance',
        resource_id: incidentId,
        status: 'success',
        details: `Breach assessment created: ${incidentDescription}`,
        metadata: {
          breach_assessment: {
            incident_id: incidentId,
            affected_patients: affectedPatients,
            risk_level: riskLevel,
            reportable: reportable,
            data_types: dataTypes
          }
        },
        phi_accessed: true
      });

      // If reportable, create alert
      if (reportable) {
        await this.createBreachAlert(assessment);
      }
    } catch (error) {
      console.error('Failed to store breach assessment:', error);
    }

    return assessment;
  }

  private generateMitigationSteps(riskLevel: string, dataTypes: string[]): string[] {
    const steps: string[] = [
      'Contain the incident immediately',
      'Assess the scope of the breach',
      'Document all evidence'
    ];

    if (riskLevel === 'high') {
      steps.push(
        'Notify affected individuals within 60 days',
        'Report to Information and Privacy Commissioner',
        'Engage legal counsel',
        'Implement additional security measures'
      );
    } else if (riskLevel === 'medium') {
      steps.push(
        'Consider notification to affected individuals',
        'Review security controls',
        'Conduct risk assessment'
      );
    }

    if (dataTypes.includes('financial_info')) {
      steps.push('Monitor for identity theft', 'Provide credit monitoring services');
    }

    return steps;
  }

  private async createBreachAlert(assessment: BreachAssessment): Promise<void> {
    try {
      await supabase.from('breach_detection_events').insert({
        event_type: 'data_breach',
        severity: 'critical',
        description: `REPORTABLE BREACH: ${assessment.description}`,
        metadata: {
          breach_assessment_id: assessment.id,
          incident_id: assessment.incidentId,
          affected_patients: assessment.affectedPatients,
          risk_level: assessment.riskLevel,
          requires_reporting: assessment.reportable
        }
      });
    } catch (error) {
      console.error('Failed to create breach alert:', error);
    }
  }

  public async validateMinimumNecessary(userId: string, requestedData: string[], purpose: string): Promise<{
    approved: boolean;
    allowedData: string[];
    deniedData: string[];
    justification: string;
  }> {
    // Define minimum necessary data by purpose
    const minimumDataByPurpose: Record<string, string[]> = {
      treatment: ['medical_history', 'current_medications', 'allergies', 'vital_signs', 'lab_results'],
      payment: ['insurance_info', 'billing_address', 'treatment_dates', 'procedure_codes'],
      operations: ['demographic_info', 'treatment_outcomes', 'quality_metrics'],
      research: ['anonymized_data', 'study_relevant_data'],
      quality_assurance: ['treatment_outcomes', 'safety_indicators', 'compliance_metrics']
    };

    const allowedForPurpose = minimumDataByPurpose[purpose] || [];
    const allowedData = requestedData.filter(data => allowedForPurpose.includes(data));
    const deniedData = requestedData.filter(data => !allowedForPurpose.includes(data));

    const approved = deniedData.length === 0;
    const justification = approved 
      ? `All requested data is necessary for ${purpose}`
      : `Some data (${deniedData.join(', ')}) is not necessary for ${purpose}`;

    // Log the minimum necessary assessment
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'MINIMUM_NECESSARY_ASSESSMENT',
        resource: 'phipa_compliance',
        status: approved ? 'success' : 'warning',
        details: justification,
        metadata: {
          purpose,
          requested_data: requestedData,
          allowed_data: allowedData,
          denied_data: deniedData,
          approved
        },
        minimum_necessary_justification: justification,
        access_purpose: purpose
      });
    } catch (error) {
      console.error('Failed to log minimum necessary assessment:', error);
    }

    return {
      approved,
      allowedData,
      deniedData,
      justification
    };
  }

  public getControlById(controlId: string): PHIPAControl | undefined {
    return this.controls.get(controlId);
  }

  public getControlsByCategory(category: PHIPAControl['category']): PHIPAControl[] {
    return Array.from(this.controls.values())
      .filter(control => control.category === category);
  }

  public getAllControls(): PHIPAControl[] {
    return Array.from(this.controls.values());
  }

  public async updateControlStatus(controlId: string, status: PHIPAControl['status'], evidence?: string[]): Promise<void> {
    const control = this.controls.get(controlId);
    if (!control) {
      throw new Error(`PHIPA control ${controlId} not found`);
    }

    control.status = status;
    control.lastReviewed = new Date();
    
    if (evidence) {
      control.evidence = evidence;
    }

    // Log the control update
    try {
      await supabase.from('audit_logs').insert({
        action: 'UPDATE_PHIPA_CONTROL',
        resource: 'phipa_controls',
        resource_id: controlId,
        status: 'success',
        details: `PHIPA control ${controlId} status updated to ${status}`,
        metadata: {
          control_id: controlId,
          new_status: status,
          evidence: evidence
        }
      });
    } catch (error) {
      console.error('Failed to log PHIPA control update:', error);
    }
  }

  public async generateComplianceReport(): Promise<{
    summary: {
      totalControls: number;
      compliantControls: number;
      compliancePercentage: number;
      criticalRisks: number;
      nextActions: string[];
    };
    controlsByCategory: Record<string, PHIPAControl[]>;
    recommendations: string[];
  }> {
    const allControls = this.getAllControls();
    const compliantControls = allControls.filter(c => c.status === 'compliant');
    const criticalRisks = allControls.filter(c => c.riskLevel === 'critical' && c.status !== 'compliant');
    
    const controlsByCategory = {
      administrative: this.getControlsByCategory('administrative'),
      technical: this.getControlsByCategory('technical'),
      physical: this.getControlsByCategory('physical')
    };

    const recommendations: string[] = [];
    
    if (criticalRisks.length > 0) {
      recommendations.push(`Address ${criticalRisks.length} critical risk controls immediately`);
    }
    
    const nonCompliant = allControls.filter(c => c.status === 'non_compliant');
    if (nonCompliant.length > 0) {
      recommendations.push(`Implement ${nonCompliant.length} non-compliant controls`);
    }
    
    const partial = allControls.filter(c => c.status === 'partial');
    if (partial.length > 0) {
      recommendations.push(`Complete implementation of ${partial.length} partially compliant controls`);
    }

    return {
      summary: {
        totalControls: allControls.length,
        compliantControls: compliantControls.length,
        compliancePercentage: (compliantControls.length / allControls.length) * 100,
        criticalRisks: criticalRisks.length,
        nextActions: recommendations.slice(0, 3)
      },
      controlsByCategory,
      recommendations
    };
  }
}

export const phipaCompliance = PHIPAComplianceService.getInstance();
export default PHIPAComplianceService;