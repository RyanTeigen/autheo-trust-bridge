import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Lock, Shield, Clock } from 'lucide-react';

interface MedicalRecordNodeData {
  recordType: 'lab-result' | 'prescription' | 'diagnosis' | 'imaging' | 'consultation';
  recordId?: string;
  patientId?: string;
  providerId?: string;
  encrypted: boolean;
  accessLevel: 'public' | 'restricted' | 'confidential' | 'sensitive';
  status: 'draft' | 'pending-review' | 'approved' | 'archived';
  lastUpdated?: string;
  requiresApproval: boolean;
}

interface MedicalRecordNodeProps {
  data: MedicalRecordNodeData;
  isConnectable: boolean;
}

export const MedicalRecordNode = memo(({ data, isConnectable }: MedicalRecordNodeProps) => {
  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'lab-result': return '🧪';
      case 'prescription': return '💊';
      case 'diagnosis': return '🩺';
      case 'imaging': return '🏥';
      case 'consultation': return '👩‍⚕️';
      default: return '📄';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'sensitive': return 'bg-destructive';
      case 'confidential': return 'bg-warning';
      case 'restricted': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending-review': return 'bg-warning';
      case 'archived': return 'bg-muted';
      default: return 'bg-secondary';
    }
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      
      <Card className="w-72 border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm">Medical Record</CardTitle>
            <span className="text-xs">{getRecordIcon(data.recordType)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {data.recordType.replace('-', ' ').toUpperCase()}
            </Badge>
            <Badge variant="secondary" className={getStatusColor(data.status)}>
              {data.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getAccessLevelColor(data.accessLevel)}>
              {data.accessLevel}
            </Badge>
            {data.encrypted && (
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">Encrypted</span>
              </div>
            )}
          </div>

          {data.requiresApproval && (
            <div className="flex items-center gap-1 text-warning">
              <Shield className="w-3 h-3" />
              <span className="text-xs">Requires Approval</span>
            </div>
          )}

          {data.lastUpdated && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="text-xs">Updated: {new Date(data.lastUpdated).toLocaleDateString()}</span>
            </div>
          )}

          <div className="space-y-1">
            {data.recordId && (
              <p className="text-xs text-muted-foreground">ID: {data.recordId.slice(0, 8)}...</p>
            )}
            {data.patientId && (
              <p className="text-xs text-muted-foreground">Patient: {data.patientId.slice(0, 8)}...</p>
            )}
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

MedicalRecordNode.displayName = 'MedicalRecordNode';