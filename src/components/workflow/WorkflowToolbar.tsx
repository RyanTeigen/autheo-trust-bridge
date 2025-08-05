import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  FileText, 
  GitBranch, 
  Bell, 
  Save, 
  Play,
  RotateCcw,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowToolbarProps {
  onAddNode: (type: string) => void;
  onSave?: () => void;
  onExecute?: () => void;
  onReset?: () => void;
  className?: string;
}

export const WorkflowToolbar = ({ 
  onAddNode, 
  onSave, 
  onExecute, 
  onReset,
  className 
}: WorkflowToolbarProps) => {
  const nodeTypes = [
    {
      type: 'patientIntake',
      label: 'Patient Intake',
      icon: User,
      description: 'Start patient registration process',
    },
    {
      type: 'soapNote',
      label: 'SOAP Note',
      icon: FileText,
      description: 'Create medical documentation',
    },
    {
      type: 'decision',
      label: 'Decision',
      icon: GitBranch,
      description: 'Add conditional logic',
    },
    {
      type: 'notification',
      label: 'Notification',
      icon: Bell,
      description: 'Send alerts or messages',
    },
  ];

  const handleAddNode = (type: string, label: string) => {
    onAddNode(type);
    toast.success(`Added ${label} node`);
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
      toast.success('Workflow saved successfully');
    }
  };

  const handleExecute = () => {
    if (onExecute) {
      onExecute();
      toast.info('Executing workflow...');
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      toast.info('Workflow reset');
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          {/* Node Types */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Add Nodes</p>
            <div className="grid grid-cols-2 gap-1">
              {nodeTypes.map((node) => (
                <Button
                  key={node.type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddNode(node.type, node.label)}
                  className="h-8 text-xs flex items-center gap-1 justify-start"
                  title={node.description}
                >
                  <node.icon className="w-3 h-3" />
                  <span className="truncate">{node.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Actions</p>
            <div className="flex flex-col gap-1">
              {onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  className="h-8 text-xs flex items-center gap-1 justify-start"
                >
                  <Save className="w-3 h-3" />
                  Save
                </Button>
              )}
              
              {onExecute && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleExecute}
                  className="h-8 text-xs flex items-center gap-1 justify-start"
                >
                  <Play className="w-3 h-3" />
                  Execute
                </Button>
              )}
              
              {onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 text-xs flex items-center gap-1 justify-start"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs flex items-center gap-1 justify-start"
          >
            <Settings className="w-3 h-3" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};