import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, User } from 'lucide-react';

interface SOAPNoteNodeData {
  patientName?: string;
  providerName?: string;
  status: 'draft' | 'in-progress' | 'completed' | 'signed';
  sections: {
    subjective: boolean;
    objective: boolean;
    assessment: boolean;
    plan: boolean;
  };
  lastUpdated?: string;
}

interface SOAPNoteNodeProps {
  data: SOAPNoteNodeData;
  isConnectable: boolean;
}

export const SOAPNoteNode = memo(({ data, isConnectable }: SOAPNoteNodeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-success';
      case 'completed': return 'bg-primary';
      case 'in-progress': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const completedSections = Object.values(data.sections).filter(Boolean).length;
  const totalSections = Object.keys(data.sections).length;

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
            <FileText className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">SOAP Note</CardTitle>
            <Badge variant="secondary" className={getStatusColor(data.status)}>
              {data.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.patientName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium">{data.patientName}</span>
            </div>
          )}
          
          {data.providerName && (
            <p className="text-xs text-muted-foreground">
              Provider: {data.providerName}
            </p>
          )}
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              Sections: {completedSections}/{totalSections}
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(data.sections).map(([section, completed]) => (
                <div key={section} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${completed ? 'bg-success' : 'bg-muted'}`} />
                  <span className="capitalize">{section.charAt(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {data.lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{data.lastUpdated}</span>
            </div>
          )}
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

SOAPNoteNode.displayName = 'SOAPNoteNode';