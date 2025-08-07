import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PatientIntakeNode } from './nodes/PatientIntakeNode';
import { SOAPNoteNode } from './nodes/SOAPNoteNode';
import { DecisionNode } from './nodes/DecisionNode';
import { NotificationNode } from './nodes/NotificationNode';
import { MedicalRecordNode } from './nodes/MedicalRecordNode';
import { ConsentNode } from './nodes/ConsentNode';
import { AppointmentNode } from './nodes/AppointmentNode';
import { ComplianceNode } from './nodes/ComplianceNode';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowPropertiesPanel } from './WorkflowPropertiesPanel';
import { Card } from '@/components/ui/card';

const nodeTypes: NodeTypes = {
  patientIntake: PatientIntakeNode,
  soapNote: SOAPNoteNode,
  decision: DecisionNode,
  notification: NotificationNode,
  medicalRecord: MedicalRecordNode,
  consent: ConsentNode,
  appointment: AppointmentNode,
  compliance: ComplianceNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'patientIntake',
    position: { x: 100, y: 100 },
    data: {
      patientName: 'John Smith',
      intakeStatus: 'in-progress',
      requiredForms: ['Medical History', 'Insurance', 'Consent'],
      completedForms: ['Medical History'],
    },
  },
  {
    id: '2',
    type: 'decision',
    position: { x: 100, y: 300 },
    data: {
      condition: 'Insurance Verified?',
      type: 'manual',
      priority: 'medium',
      criteria: ['Insurance card scanned', 'Eligibility confirmed'],
    },
  },
  {
    id: '3',
    type: 'soapNote',
    position: { x: 400, y: 300 },
    data: {
      patientName: 'John Smith',
      providerName: 'Dr. Sarah Johnson',
      status: 'in-progress',
      sections: {
        subjective: true,
        objective: true,
        assessment: false,
        plan: false,
      },
      lastUpdated: '2 mins ago',
    },
  },
  {
    id: '4',
    type: 'notification',
    position: { x: 400, y: 500 },
    data: {
      type: 'email',
      recipients: ['patient@example.com'],
      subject: 'Appointment Summary',
      priority: 'medium',
      status: 'pending',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    sourceHandle: 'yes',
    type: 'smoothstep',
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'smoothstep',
  },
];

interface WorkflowDesignerProps {
  templateId?: string;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  readonly?: boolean;
}

export const WorkflowDesigner = ({ templateId, onSave, readonly = false }: WorkflowDesignerProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (!readonly) {
      setSelectedNode(node);
      setIsPropertiesPanelOpen(true);
    }
  }, [readonly]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: getDefaultNodeData(type),
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, setNodes]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
    // Update selected node if it's the one being modified
    if (selectedNode?.id === nodeId) {
      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...newData } });
    }
  }, [selectedNode, setNodes]);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 relative">
        {!readonly && (
          <WorkflowToolbar 
            onAddNode={addNode}
            onSave={handleSave}
            className="absolute top-4 left-4 z-10"
          />
        )}
        
        <Card className="h-full rounded-none border-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
          >
            <Background 
              color="hsl(var(--muted))" 
              gap={20} 
              size={1}
            />
            <Controls 
              className="[&>button]:bg-background [&>button]:border-border [&>button]:text-foreground"
            />
            <MiniMap 
              className="bg-background border border-border"
              nodeColor="hsl(var(--primary))"
              maskColor="hsl(var(--muted) / 0.8)"
            />
          </ReactFlow>
        </Card>
      </div>

      {isPropertiesPanelOpen && selectedNode && !readonly && (
        <WorkflowPropertiesPanel
          node={selectedNode}
          onClose={() => setIsPropertiesPanelOpen(false)}
          onUpdateNode={updateNodeData}
        />
      )}
    </div>
  );
};

function getDefaultNodeData(type: string) {
  switch (type) {
    case 'patientIntake':
      return {
        patientName: '',
        intakeStatus: 'pending',
        requiredForms: ['Medical History', 'Insurance', 'Consent'],
        completedForms: [],
      };
    case 'soapNote':
      return {
        patientName: '',
        providerName: '',
        status: 'draft',
        sections: {
          subjective: false,
          objective: false,
          assessment: false,
          plan: false,
        },
        lastUpdated: new Date().toISOString(),
      };
    case 'medicalRecord':
      return {
        recordType: 'consultation',
        encrypted: true,
        accessLevel: 'restricted',
        status: 'draft',
        requiresApproval: true,
        lastUpdated: new Date().toISOString(),
      };
    case 'appointment':
      return {
        appointmentType: 'consultation',
        status: 'scheduled',
        urgencyLevel: 'routine',
        requiresPrep: false,
        telehealth: false,
        duration: 30,
      };
    case 'consent':
      return {
        consentType: 'treatment',
        status: 'pending',
        urgencyLevel: 'normal',
        digitalSignature: false,
        witnessed: false,
        autoExpiry: false,
      };
    case 'compliance':
      return {
        complianceType: 'hipaa',
        status: 'pending-review',
        riskLevel: 'medium',
        automated: false,
        requiresDocumentation: true,
        violations: 0,
      };
    case 'decision':
      return {
        condition: 'New Decision',
        description: '',
        type: 'manual',
        priority: 'medium',
        criteria: [],
      };
    case 'notification':
      return {
        type: 'in-app',
        subject: 'New Notification',
        priority: 'medium',
        recipients: [],
        status: 'pending',
      };
    default:
      return {};
  }
}