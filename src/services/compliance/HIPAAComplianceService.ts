// HIPAA Compliance Service - Phase 1: Core HIPAA Requirements
import { supabase } from '@/integrations/supabase/client';

export interface HIPAAControl {
  id: string;
  control_id: string;
  category: 'administrative' | 'physical' | 'technical';
  subcategory?: string | null;
  title: string;
  description: string;
  implementation_status: 'implemented' | 'partially_implemented' | 'not_implemented' | 'not_applicable';
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  evidence_required: string[] | null;
  current_evidence: string[] | null;
  compliance_notes?: string | null;
  last_assessment_date?: string | null;
  next_review_date?: string | null;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HIPAARiskAssessment {
  id: string;
  assessment_name: string;
  assessment_type: 'annual' | 'incident_based' | 'ad_hoc' | 'vendor_assessment';
  scope: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  identified_vulnerabilities: Record<string, any> | null;
  mitigation_plan: Record<string, any> | null;
  status: 'planned' | 'in_progress' | 'completed' | 'requires_action';
  conducted_by?: string | null;
  approved_by?: string | null;
  assessment_date: string;
  completion_date?: string | null;
  next_assessment_date?: string | null;
  findings_summary?: string | null;
  recommendations: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessAssociateAgreement {
  id: string;
  vendor_name: string;
  vendor_contact_email?: string | null;
  agreement_type: 'baa' | 'dpa' | 'subcontractor';
  services_provided: string;
  phi_access_level: 'full' | 'limited' | 'none';
  agreement_signed_date?: string | null;
  agreement_expiry_date?: string | null;
  renewal_required: boolean;
  compliance_status: 'compliant' | 'pending' | 'non_compliant' | 'expired';
  last_audit_date?: string | null;
  next_audit_date?: string | null;
  security_requirements?: Record<string, any> | null;
  breach_notification_requirements?: Record<string, any> | null;
  termination_procedures?: Record<string, any> | null;
  document_location?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceStatus {
  overall_score: number;
  total_controls: number;
  implemented_controls: number;
  high_risk_gaps: number;
  critical_findings: number;
  next_actions: string[];
  last_assessment: Date | null;
  compliance_trends: {
    last_30_days: number;
    last_90_days: number;
  };
}

class HIPAAComplianceService {
  private static instance: HIPAAComplianceService;

  private constructor() {}

  public static getInstance(): HIPAAComplianceService {
    if (!HIPAAComplianceService.instance) {
      HIPAAComplianceService.instance = new HIPAAComplianceService();
    }
    return HIPAAComplianceService.instance;
  }

  // Initialize default HIPAA controls
  async initializeHIPAAControls(): Promise<void> {
    const defaultControls: Omit<HIPAAControl, 'id' | 'created_at' | 'updated_at'>[] = [
      // Administrative Safeguards (§164.308)
      {
        control_id: 'ADM-001',
        category: 'administrative',
        subcategory: 'Assigned Security Responsibility',
        title: 'Security Officer Assignment (§164.308(a)(2))',
        description: 'Assign a security officer who is responsible for the entity\'s security policies and procedures.',
        implementation_status: 'not_implemented',
        risk_level: 'critical',
        evidence_required: ['Security officer appointment letter', 'Job description', 'Training records'],
        current_evidence: []
      },
      {
        control_id: 'ADM-002',
        category: 'administrative',
        subcategory: 'Workforce Training and Access Management',
        title: 'Workforce Training (§164.308(a)(5))',
        description: 'Train all workforce members on PHI security policies and procedures.',
        implementation_status: 'not_implemented',
        risk_level: 'high',
        evidence_required: ['Training curriculum', 'Training records', 'Annual refresher training'],
        current_evidence: []
      },
      {
        control_id: 'ADM-003',
        category: 'administrative',
        subcategory: 'Information Access Management',
        title: 'Information Access Management (§164.308(a)(4))',
        description: 'Implement procedures for authorizing access to PHI.',
        implementation_status: 'not_implemented',
        risk_level: 'critical',
        evidence_required: ['Access authorization procedures', 'Role-based access matrix', 'Access review logs'],
        current_evidence: []
      },
      {
        control_id: 'ADM-004',
        category: 'administrative',
        subcategory: 'Security Incident Procedures',
        title: 'Security Incident Procedures (§164.308(a)(6))',
        description: 'Implement procedures to address security incidents.',
        implementation_status: 'not_implemented',
        risk_level: 'high',
        evidence_required: ['Incident response plan', 'Incident logs', 'Response procedures'],
        current_evidence: []
      },
      {
        control_id: 'ADM-005',
        category: 'administrative',
        subcategory: 'Contingency Plan',
        title: 'Contingency Plan (§164.308(a)(7))',
        description: 'Establish procedures for responding to emergencies or other occurrences.',
        implementation_status: 'not_implemented',
        risk_level: 'high',
        evidence_required: ['Contingency plan', 'Backup procedures', 'Recovery testing records'],
        current_evidence: []
      },

      // Physical Safeguards (§164.310)
      {
        control_id: 'PHY-001',
        category: 'physical',
        subcategory: 'Facility Access Controls',
        title: 'Facility Access Controls (§164.310(a)(1))',
        description: 'Limit physical access to facilities while ensuring authorized access.',
        implementation_status: 'not_implemented',
        risk_level: 'high',
        evidence_required: ['Access control policy', 'Badge/key logs', 'Facility security assessment'],
        current_evidence: []
      },
      {
        control_id: 'PHY-002',
        category: 'physical',
        subcategory: 'Workstation Use',
        title: 'Workstation Use (§164.310(b))',
        description: 'Implement policies and procedures for workstation use and access to PHI.',
        implementation_status: 'not_implemented',
        risk_level: 'medium',
        evidence_required: ['Workstation use policy', 'Screen lock settings', 'Clean desk policy'],
        current_evidence: []
      },
      {
        control_id: 'PHY-003',
        category: 'physical',
        subcategory: 'Device and Media Controls',
        title: 'Device and Media Controls (§164.310(d)(1))',
        description: 'Implement policies for receipt, removal, and disposal of hardware and media.',
        implementation_status: 'not_implemented',
        risk_level: 'high',
        evidence_required: ['Media handling policy', 'Disposal records', 'Encryption standards'],
        current_evidence: []
      },

      // Technical Safeguards (§164.312)
      {
        control_id: 'TEC-001',
        category: 'technical',
        subcategory: 'Access Control',
        title: 'Access Control (§164.312(a)(1))',
        description: 'Implement technical policies for allowing access only to authorized persons.',
        implementation_status: 'not_implemented',
        risk_level: 'critical',
        evidence_required: ['Authentication system', 'User access logs', 'Role definitions'],
        current_evidence: []
      },
      {
        control_id: 'TEC-002',
        category: 'technical',
        subcategory: 'Audit Controls',
        title: 'Audit Controls (§164.312(b))',
        description: 'Implement hardware, software, and procedural mechanisms to record access to PHI.',
        implementation_status: 'not_implemented',
        risk_level: 'critical',
        evidence_required: ['Audit log system', 'Log review procedures', 'Audit trails'],
        current_evidence: []
      },
      {
        control_id: 'TEC-003',
        category: 'technical',
        subcategory: 'Integrity',
        title: 'Integrity (§164.312(c)(1))',
        description: 'Protect PHI from improper alteration or destruction.',
        implementation_status: 'not_implemented',
        risk_level: 'high',
        evidence_required: ['Data integrity controls', 'Checksums/hashes', 'Version controls'],
        current_evidence: []
      },
      {
        control_id: 'TEC-004',
        category: 'technical',
        subcategory: 'Transmission Security',
        title: 'Transmission Security (§164.312(e)(1))',
        description: 'Implement technical safeguards to guard against unauthorized access to PHI transmitted over networks.',
        implementation_status: 'not_implemented',
        risk_level: 'critical',
        evidence_required: ['Encryption in transit', 'Network security protocols', 'VPN policies'],
        current_evidence: []
      },
      {
        control_id: 'TEC-005',
        category: 'technical',
        subcategory: 'Encryption',
        title: 'Encryption and Decryption (§164.312(a)(2)(iv))',
        description: 'Implement mechanisms to encrypt and decrypt PHI.',
        implementation_status: 'not_implemented',
        risk_level: 'critical',
        evidence_required: ['Encryption standards', 'Key management procedures', 'Encryption audit'],
        current_evidence: []
      }
    ];

    // Check if controls already exist
    const { data: existingControls } = await supabase
      .from('hipaa_compliance_controls')
      .select('control_id');

    const existingControlIds = existingControls?.map(c => c.control_id) || [];

    // Insert only new controls
    const newControls = defaultControls.filter(
      control => !existingControlIds.includes(control.control_id)
    );

    if (newControls.length > 0) {
      const { error } = await supabase
        .from('hipaa_compliance_controls')
        .insert(newControls);

      if (error) {
        console.error('Error initializing HIPAA controls:', error);
        throw error;
      }
    }
  }

  // Get all HIPAA controls
  async getHIPAAControls(): Promise<HIPAAControl[]> {
    const { data, error } = await supabase
      .from('hipaa_compliance_controls')
      .select('*')
      .order('control_id');

    if (error) {
      console.error('Error fetching HIPAA controls:', error);
      throw error;
    }

    return (data as HIPAAControl[]) || [];
  }

  // Update control implementation status
  async updateControlStatus(
    controlId: string, 
    status: HIPAAControl['implementation_status'],
    evidence?: string[],
    notes?: string
  ): Promise<void> {
    const updates: any = { 
      implementation_status: status,
      last_assessment_date: new Date().toISOString()
    };
    
    if (evidence) updates.current_evidence = evidence;
    if (notes) updates.compliance_notes = notes;

    const { error } = await supabase
      .from('hipaa_compliance_controls')
      .update(updates)
      .eq('id', controlId);

    if (error) {
      console.error('Error updating control status:', error);
      throw error;
    }
  }

  // Get compliance status overview
  async getComplianceStatus(): Promise<ComplianceStatus> {
    const { data: controls, error } = await supabase
      .from('hipaa_compliance_controls')
      .select('*');

    if (error) {
      console.error('Error fetching compliance status:', error);
      throw error;
    }

    const totalControls = controls?.length || 0;
    const implementedControls = controls?.filter(c => c.implementation_status === 'implemented').length || 0;
    const highRiskGaps = controls?.filter(c => 
      c.risk_level === 'critical' && c.implementation_status !== 'implemented'
    ).length || 0;

    const overallScore = totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0;

    const criticalFindings = controls?.filter(c => 
      c.risk_level === 'critical' && c.implementation_status === 'not_implemented'
    ).length || 0;

    const nextActions = this.generateNextActions(controls || []);

    // Get last assessment date
    const lastAssessment = controls
      ?.filter(c => c.last_assessment_date)
      .map(c => new Date(c.last_assessment_date))
      .sort((a, b) => b.getTime() - a.getTime())[0] || null;

    return {
      overall_score: overallScore,
      total_controls: totalControls,
      implemented_controls: implementedControls,
      high_risk_gaps: highRiskGaps,
      critical_findings: criticalFindings,
      next_actions: nextActions,
      last_assessment: lastAssessment,
      compliance_trends: {
        last_30_days: overallScore, // TODO: Implement trend tracking
        last_90_days: overallScore
      }
    };
  }

  // Generate next action recommendations
  private generateNextActions(controls: any[]): string[] {
    const actions: string[] = [];

    const criticalGaps = controls.filter(c => 
      c.risk_level === 'critical' && c.implementation_status !== 'implemented'
    );

    if (criticalGaps.length > 0) {
      actions.push(`Address ${criticalGaps.length} critical compliance gaps immediately`);
      actions.push(`Assign security officer (if ADM-001 not implemented)`);
      actions.push(`Implement access controls and audit logging (TEC-001, TEC-002)`);
    }

    const noEvidence = controls.filter(c => 
      c.implementation_status === 'implemented' && (!c.current_evidence || c.current_evidence.length === 0)
    );

    if (noEvidence.length > 0) {
      actions.push(`Collect evidence for ${noEvidence.length} implemented controls`);
    }

    const overdueReviews = controls.filter(c => 
      c.next_review_date && new Date(c.next_review_date) < new Date()
    );

    if (overdueReviews.length > 0) {
      actions.push(`Conduct overdue reviews for ${overdueReviews.length} controls`);
    }

    if (actions.length === 0) {
      actions.push('Continue regular compliance monitoring and assessment');
    }

    return actions.slice(0, 5); // Return top 5 actions
  }

  // Create a new risk assessment
  async createRiskAssessment(assessment: Omit<HIPAARiskAssessment, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('hipaa_risk_assessments')
      .insert(assessment)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating risk assessment:', error);
      throw error;
    }

    return data.id;
  }

  // Get risk assessments
  async getRiskAssessments(): Promise<HIPAARiskAssessment[]> {
    const { data, error } = await supabase
      .from('hipaa_risk_assessments')
      .select('*')
      .order('assessment_date', { ascending: false });

    if (error) {
      console.error('Error fetching risk assessments:', error);
      throw error;
    }

    return (data as HIPAARiskAssessment[]) || [];
  }

  // Manage Business Associate Agreements
  async createBAA(baa: Omit<BusinessAssociateAgreement, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('business_associate_agreements')
      .insert(baa)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating BAA:', error);
      throw error;
    }

    return data.id;
  }

  async getBAAs(): Promise<BusinessAssociateAgreement[]> {
    const { data, error } = await supabase
      .from('business_associate_agreements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching BAAs:', error);
      throw error;
    }

    return (data as BusinessAssociateAgreement[]) || [];
  }

  // Check for upcoming compliance deadlines
  async getUpcomingDeadlines(): Promise<Array<{type: string, description: string, due_date: Date, priority: string}>> {
    const deadlines: Array<{type: string, description: string, due_date: Date, priority: string}> = [];

    // Check BAA renewals
    const { data: baas } = await supabase
      .from('business_associate_agreements')
      .select('*')
      .not('agreement_expiry_date', 'is', null);

    baas?.forEach(baa => {
      const expiryDate = new Date(baa.agreement_expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 90 && daysUntilExpiry > 0) {
        deadlines.push({
          type: 'BAA Renewal',
          description: `${baa.vendor_name} BAA expires in ${daysUntilExpiry} days`,
          due_date: expiryDate,
          priority: daysUntilExpiry <= 30 ? 'high' : 'medium'
        });
      }
    });

    // Check control reviews
    const { data: controls } = await supabase
      .from('hipaa_compliance_controls')
      .select('*')
      .not('next_review_date', 'is', null);

    controls?.forEach(control => {
      const reviewDate = new Date(control.next_review_date);
      const daysUntilReview = Math.ceil((reviewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilReview <= 30 && daysUntilReview > 0) {
        deadlines.push({
          type: 'Control Review',
          description: `${control.title} review due in ${daysUntilReview} days`,
          due_date: reviewDate,
          priority: control.risk_level === 'critical' ? 'high' : 'medium'
        });
      }
    });

    return deadlines.sort((a, b) => a.due_date.getTime() - b.due_date.getTime());
  }
}

export const hipaaCompliance = HIPAAComplianceService.getInstance();
export default HIPAAComplianceService;