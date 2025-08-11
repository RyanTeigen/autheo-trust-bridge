import { WorkflowTemplate, WorkflowExecution, WorkflowNode, WorkflowEdge } from '@/types/workflow';

export class WorkflowService {
  private static templates: WorkflowTemplate[] = [
    {
      id: 'patient-intake-flow',
      name: 'Patient Intake Workflow',
      description: 'Complete patient registration and intake process',
      category: 'patient-care',
      nodes: [
        {
          id: '1',
          type: 'patientIntake',
          position: { x: 100, y: 100 },
          data: {
            intakeStatus: 'pending',
            requiredForms: ['Medical History', 'Insurance', 'Consent'],
            completedForms: [],
          },
        },
        {
          id: '2',
          type: 'decision',
          position: { x: 100, y: 300 },
          data: {
            condition: 'All Forms Completed?',
            type: 'automatic',
            priority: 'medium',
            criteria: ['Medical History submitted', 'Insurance verified', 'Consent signed'],
          },
        },
        {
          id: '3',
          type: 'notification',
          position: { x: 400, y: 300 },
          data: {
            type: 'email',
            recipients: ['provider@hospital.com'],
            subject: 'New Patient Ready for Appointment',
            priority: 'medium',
            status: 'pending',
          },
        },
      ],
      edges: [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
        },
        {
          id: 'e2-3',
          source: '2',
          target: '3',
          data: { condition: 'yes' },
        },
      ],
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['intake', 'registration', 'patient-care'],
      },
    },
    {
      id: 'soap-note-flow',
      name: 'SOAP Note Documentation',
      description: 'Structured clinical documentation workflow',
      category: 'patient-care',
      nodes: [
        {
          id: '1',
          type: 'soapNote',
          position: { x: 100, y: 100 },
          data: {
            status: 'draft',
            sections: {
              subjective: false,
              objective: false,
              assessment: false,
              plan: false,
            },
          },
        },
        {
          id: '2',
          type: 'decision',
          position: { x: 100, y: 300 },
          data: {
            condition: 'Note Complete?',
            type: 'manual',
            priority: 'medium',
            criteria: ['All sections filled', 'Provider review complete'],
          },
        },
        {
          id: '3',
          type: 'notification',
          position: { x: 400, y: 300 },
          data: {
            type: 'in-app',
            recipients: ['patient'],
            subject: 'Visit Summary Available',
            priority: 'low',
            status: 'pending',
          },
        },
      ],
      edges: [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
        },
        {
          id: 'e2-3',
          source: '2',
          target: '3',
          data: { condition: 'yes' },
        },
      ],
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['documentation', 'soap', 'clinical'],
      },
    },
    {
      id: 'appointment-follow-up',
      name: 'Appointment Follow-up',
      description: 'Post-appointment patient follow-up workflow',
      category: 'administrative',
      nodes: [
        {
          id: '1',
          type: 'notification',
          position: { x: 100, y: 100 },
          data: {
            type: 'email',
            recipients: ['patient@example.com'],
            subject: 'Thank you for your visit',
            priority: 'low',
            status: 'pending',
          },
        },
        {
          id: '2',
          type: 'decision',
          position: { x: 100, y: 300 },
          data: {
            condition: 'Follow-up Required?',
            type: 'conditional',
            priority: 'medium',
            criteria: ['Provider recommendation', 'Treatment plan status'],
          },
        },
        {
          id: '3',
          type: 'notification',
          position: { x: 400, y: 300 },
          data: {
            type: 'sms',
            recipients: ['patient'],
            subject: 'Schedule Follow-up Appointment',
            priority: 'medium',
            status: 'pending',
          },
        },
      ],
      edges: [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
        },
        {
          id: 'e2-3',
          source: '2',
          target: '3',
          data: { condition: 'yes' },
        },
      ],
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['follow-up', 'administrative', 'patient-care'],
      },
    },
    {
      id: 'consent-grant-workflow',
      name: 'Consent Grant Workflow',
      description: 'Patient grants consent, hash generated and anchored, parties notified',
      category: 'compliance',
      nodes: [
        {
          id: '1',
          type: 'consentRequest',
          position: { x: 100, y: 100 },
          data: {
            requester: 'provider_or_app',
            dataTypes: ['demographics', 'labs'],
            duration: '30d',
            status: 'pending'
          }
        },
        {
          id: '2',
          type: 'decision',
          position: { x: 100, y: 300 },
          data: {
            condition: 'User grants consent?',
            type: 'manual',
            priority: 'high',
            criteria: ['checkbox_acknowledged']
          }
        },
        {
          id: '3',
          type: 'task',
          position: { x: 400, y: 300 },
          data: {
            action: 'hash_and_anchor_consent',
            integration: 'anchorConsentToBlockchain',
            status: 'pending'
          }
        },
        {
          id: '4',
          type: 'notification',
          position: { x: 700, y: 300 },
          data: {
            type: 'in-app',
            recipients: ['patient', 'requester'],
            subject: 'Consent Recorded and Anchored',
            priority: 'medium',
            status: 'pending'
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3', data: { condition: 'yes' } },
        { id: 'e3-4', source: '3', target: '4' }
      ],
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['consent', 'compliance', 'blockchain']
      }
    },
    {
      id: 'consent-revoke-workflow',
      name: 'Consent Revocation Workflow',
      description: 'Patient revokes consent, revocation hash queued/anchored, notify stakeholders',
      category: 'compliance',
      nodes: [
        {
          id: '1',
          type: 'revokeConsent',
          position: { x: 100, y: 100 },
          data: {
            reason: 'user_initiated',
            status: 'pending'
          }
        },
        {
          id: '2',
          type: 'task',
          position: { x: 100, y: 300 },
          data: {
            action: 'generate_revocation_hash',
            integration: 'revokeConsent',
            status: 'pending'
          }
        },
        {
          id: '3',
          type: 'task',
          position: { x: 400, y: 300 },
          data: {
            action: 'queue_anchor_revocation',
            integration: 'hash_anchor_queue',
            status: 'pending'
          }
        },
        {
          id: '4',
          type: 'notification',
          position: { x: 700, y: 300 },
          data: {
            type: 'in-app',
            recipients: ['patient', 'affected_providers'],
            subject: 'Consent Revoked',
            priority: 'high',
            status: 'pending'
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' }
      ],
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['consent', 'revocation', 'compliance', 'blockchain']
      }
    }
  ];

  private static executions: WorkflowExecution[] = [];

  // Template Management
  static async getTemplates(): Promise<WorkflowTemplate[]> {
    return this.templates;
  }

  static async getTemplate(id: string): Promise<WorkflowTemplate | null> {
    return this.templates.find(template => template.id === id) || null;
  }

  static async getTemplatesByCategory(category: string): Promise<WorkflowTemplate[]> {
    return this.templates.filter(template => template.category === category);
  }

  static async saveTemplate(template: WorkflowTemplate): Promise<void> {
    const existingIndex = this.templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      this.templates[existingIndex] = {
        ...template,
        metadata: {
          ...template.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
    } else {
      this.templates.push({
        ...template,
        metadata: {
          ...template.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  }

  static async deleteTemplate(id: string): Promise<void> {
    this.templates = this.templates.filter(template => template.id !== id);
  }

  // Workflow Execution
  static async executeWorkflow(templateId: string, variables: Record<string, any>): Promise<WorkflowExecution> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      status: 'running',
      variables,
      results: {},
      startedAt: new Date().toISOString(),
      executedBy: 'current-user', // In real implementation, get from auth context
    };

    this.executions.push(execution);
    
    // Simulate workflow execution
    this.simulateExecution(execution);
    
    return execution;
  }

  static async getExecution(id: string): Promise<WorkflowExecution | null> {
    return this.executions.find(exec => exec.id === id) || null;
  }

  static async getExecutions(): Promise<WorkflowExecution[]> {
    return this.executions;
  }

  static async getExecutionsByTemplate(templateId: string): Promise<WorkflowExecution[]> {
    return this.executions.filter(exec => exec.templateId === templateId);
  }

  // Private helper methods
  private static async simulateExecution(execution: WorkflowExecution): Promise<void> {
    // Simulate processing delay
    setTimeout(() => {
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
      execution.results = {
        nodesExecuted: 3,
        notifications: 1,
        decisions: 1,
      };
    }, 2000);
  }

  // Validation helpers
  static validateTemplate(template: WorkflowTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.name?.trim()) {
      errors.push('Template name is required');
    }

    if (!template.nodes || template.nodes.length === 0) {
      errors.push('Template must have at least one node');
    }

    // Validate node connections
    const nodeIds = new Set(template.nodes.map(node => node.id));
    template.edges.forEach(edge => {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge source node ${edge.source} not found`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge target node ${edge.target} not found`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Integration helpers
  static async integrateWithSmartForms(templateId: string, formData: any): Promise<void> {
    // Integration point with SmartForms context
    const template = await this.getTemplate(templateId);
    if (template) {
      // Process form data and update workflow nodes
      template.nodes.forEach(node => {
        if (node.type === 'patientIntake') {
          node.data = { ...node.data, ...formData };
        }
      });
      await this.saveTemplate(template);
    }
  }
}