import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, FileText } from 'lucide-react';

interface PatientIntakeNodeData {
  patientName?: string;
  intakeStatus: 'pending' | 'in-progress' | 'completed';
  requiredForms: string[];
  completedForms: string[];
}

interface PatientIntakeNodeProps {
  data: PatientIntakeNodeData;
  isConnectable: boolean;
}

export const PatientIntakeNode = memo(({ data, isConnectable }: PatientIntakeNodeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in-progress': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const progress = data.requiredForms.length > 0 
    ? (data.completedForms.length / data.requiredForms.length) * 100 
    : 0;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      
      <Card className="w-64 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">Patient Intake</CardTitle>
            <Badge variant="secondary" className={getStatusColor(data.intakeStatus)}>
              {data.intakeStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.patientName && (
            <p className="text-sm font-medium">{data.patientName}</p>
          )}
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="w-3 h-3" />
              <span>Forms: {data.completedForms.length}/{data.requiredForms.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
    </>
  );
});

PatientIntakeNode.displayName = 'PatientIntakeNode';