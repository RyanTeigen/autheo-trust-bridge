export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  style?: React.CSSProperties;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: any;
  style?: React.CSSProperties;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'patient-care' | 'administrative' | 'diagnostic' | 'compliance';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    version: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
  };
}

export interface WorkflowExecution {
  id: string;
  templateId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  currentStep?: string;
  variables: Record<string, any>;
  results: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  executedBy: string;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: any;
  required: boolean;
  description?: string;
}

export interface NodeDefinition {
  type: string;
  name: string;
  description: string;
  category: 'input' | 'process' | 'decision' | 'output' | 'integration';
  inputs: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  outputs: Array<{
    name: string;
    type: string;
  }>;
  properties: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
  }>;
}