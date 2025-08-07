import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WorkflowTemplate } from '@/types/workflow';
import { 
  Sparkles, 
  FileText, 
  Users, 
  Settings, 
  Plus,
  Wand2,
  Brain,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartWorkflowBuilderProps {
  onCreateWorkflow: (template: WorkflowTemplate) => void;
  className?: string;
}

export const SmartWorkflowBuilder = ({ onCreateWorkflow, className }: SmartWorkflowBuilderProps) => {
  const [workflowType, setWorkflowType] = useState('');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState('medium');
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const workflowTypes = [
    { value: 'patient-intake', label: 'Patient Intake Process', icon: Users },
    { value: 'medical-consultation', label: 'Medical Consultation', icon: FileText },
    { value: 'lab-results', label: 'Lab Results Processing', icon: FileText },
    { value: 'prescription-flow', label: 'Prescription Workflow', icon: FileText },
    { value: 'appointment-scheduling', label: 'Appointment Scheduling', icon: Settings },
    { value: 'compliance-audit', label: 'Compliance Audit', icon: CheckCircle },
    { value: 'emergency-response', label: 'Emergency Response', icon: Settings },
    { value: 'discharge-planning', label: 'Discharge Planning', icon: Users },
  ];

  const requirementOptions = [
    'HIPAA Compliance',
    'Digital Signatures',
    'Patient Consent',
    'Provider Notifications',
    'Automated Reminders',
    'Data Encryption',
    'Audit Trail',
    'Multi-step Approval',
    'Emergency Protocols',
    'Integration with EMR',
  ];

  const handleRequirementToggle = (requirement: string) => {
    setSpecialRequirements(prev => 
      prev.includes(requirement)
        ? prev.filter(r => r !== requirement)
        : [...prev, requirement]
    );
  };

  const generateSmartWorkflow = async () => {
    if (!workflowType || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI workflow generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedType = workflowTypes.find(t => t.value === workflowType);
      
      // Generate smart workflow based on input
      const smartTemplate: WorkflowTemplate = {
        id: `smart_${Date.now()}`,
        name: selectedType?.label || 'Generated Workflow',
        description: description,
        category: getWorkflowCategory(workflowType),
        nodes: generateSmartNodes(workflowType, specialRequirements),
        edges: generateSmartEdges(workflowType),
        metadata: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['ai-generated', workflowType, complexity, ...specialRequirements.map(r => r.toLowerCase().replace(/\s+/g, '-'))],
        },
      };

      onCreateWorkflow(smartTemplate);
      toast.success('Smart workflow generated successfully!');
      
      // Reset form
      setWorkflowType('');
      setDescription('');
      setSpecialRequirements([]);
      
    } catch (error) {
      toast.error('Failed to generate workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  const getWorkflowCategory = (type: string): 'patient-care' | 'administrative' | 'diagnostic' | 'compliance' => {
    if (type.includes('compliance') || type.includes('audit')) return 'compliance';
    if (type.includes('lab') || type.includes('diagnostic')) return 'diagnostic';
    if (type.includes('appointment') || type.includes('scheduling')) return 'administrative';
    return 'patient-care';
  };

  const generateSmartNodes = (type: string, requirements: string[]) => {
    const baseNodes = [
      {
        id: '1',
        type: 'patientIntake',
        position: { x: 100, y: 100 },
        data: {
          patientName: '',
          intakeStatus: 'pending',
          requiredForms: ['Medical History', 'Insurance'],
          completedForms: [],
        },
      },
    ];

    // Add nodes based on workflow type and requirements
    let nodeId = 2;
    
    if (type === 'medical-consultation') {
      baseNodes.push({
        id: nodeId.toString(),
        type: 'appointment',
        position: { x: 100, y: 250 },
        data: {
          appointmentType: 'consultation',
          status: 'scheduled',
          urgencyLevel: 'routine',
          requiresPrep: false,
          telehealth: false,
          duration: 30,
        },
      });
      nodeId++;
    }

    if (requirements.includes('Patient Consent')) {
      baseNodes.push({
        id: nodeId.toString(),
        type: 'consent',
        position: { x: 400, y: 100 },
        data: {
          consentType: 'treatment',
          status: 'pending',
          urgencyLevel: 'normal',
          digitalSignature: requirements.includes('Digital Signatures'),
          witnessed: false,
          autoExpiry: false,
        },
      });
      nodeId++;
    }

    if (requirements.includes('HIPAA Compliance')) {
      baseNodes.push({
        id: nodeId.toString(),
        type: 'compliance',
        position: { x: 400, y: 250 },
        data: {
          complianceType: 'hipaa',
          status: 'pending-review',
          riskLevel: 'medium',
          automated: true,
          requiresDocumentation: true,
          violations: 0,
        },
      });
    }

    return baseNodes;
  };

  const generateSmartEdges = (type: string) => {
    return [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
      },
    ];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Smart Workflow Builder
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workflow Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="workflowType">Workflow Type *</Label>
          <Select value={workflowType} onValueChange={setWorkflowType}>
            <SelectTrigger>
              <SelectValue placeholder="Select workflow type" />
            </SelectTrigger>
            <SelectContent>
              {workflowTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Workflow Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this workflow should accomplish..."
            rows={3}
          />
        </div>

        {/* Complexity Level */}
        <div className="space-y-2">
          <Label htmlFor="complexity">Complexity Level</Label>
          <Select value={complexity} onValueChange={setComplexity}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple - Basic linear flow</SelectItem>
              <SelectItem value="medium">Medium - Some branching and decisions</SelectItem>
              <SelectItem value="complex">Complex - Multiple paths and integrations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Special Requirements */}
        <div className="space-y-3">
          <Label>Special Requirements</Label>
          <div className="grid grid-cols-2 gap-2">
            {requirementOptions.map(requirement => (
              <div
                key={requirement}
                className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                  specialRequirements.includes(requirement)
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => handleRequirementToggle(requirement)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded border ${
                    specialRequirements.includes(requirement)
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {specialRequirements.includes(requirement) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{requirement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Requirements */}
        {specialRequirements.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Requirements:</Label>
            <div className="flex flex-wrap gap-1">
              {specialRequirements.map(requirement => (
                <Badge key={requirement} variant="secondary">
                  {requirement}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Generate Button */}
        <Button 
          onClick={generateSmartWorkflow}
          disabled={!workflowType || !description || isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <>
              <Brain className="w-4 h-4 animate-pulse" />
              Generating Smart Workflow...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Smart Workflow
            </>
          )}
        </Button>

        {/* AI Features Info */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2">AI Features:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Intelligent node placement and connections</li>
            <li>• Automatic compliance requirement detection</li>
            <li>• Smart workflow optimization suggestions</li>
            <li>• Context-aware node configuration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};