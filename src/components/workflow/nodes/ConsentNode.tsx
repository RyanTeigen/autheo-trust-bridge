import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck, UserCheck, Clock, AlertTriangle } from 'lucide-react';

interface ConsentNodeData {
  consentType: 'treatment' | 'data-sharing' | 'research' | 'marketing' | 'emergency';
  status: 'pending' | 'granted' | 'denied' | 'expired' | 'revoked';
  patientId?: string;
  expiryDate?: string;
  digitalSignature: boolean;
  witnessed: boolean;
  urgencyLevel: 'normal' | 'urgent' | 'emergency';
  autoExpiry: boolean;
}

interface ConsentNodeProps {
  data: ConsentNodeData;
  isConnectable: boolean;
}

export const ConsentNode = memo(({ data, isConnectable }: ConsentNodeProps) => {
  const getConsentIcon = (type: string) => {
    switch (type) {
      case 'treatment': return '🏥';
      case 'data-sharing': return '🔄';
      case 'research': return '🔬';
      case 'marketing': return '📢';
      case 'emergency': return '🚨';
      default: return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted': return 'bg-success';
      case 'denied': return 'bg-destructive';
      case 'expired': return 'bg-warning';
      case 'revoked': return 'bg-destructive';
      default: return 'bg-warning';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-destructive';
      case 'urgent': return 'bg-warning';
      default: return 'bg-primary';
    }
  };

  const isExpiringSoon = () => {
    if (!data.expiryDate) return false;
    const expiryDate = new Date(data.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      
      <Card className="w-72 border-secondary/20 bg-secondary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-secondary" />
            <CardTitle className="text-sm">Consent Management</CardTitle>
            <span className="text-xs">{getConsentIcon(data.consentType)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {data.consentType.replace('-', ' ').toUpperCase()}
            </Badge>
            <Badge variant="secondary" className={getStatusColor(data.status)}>
              {data.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getUrgencyColor(data.urgencyLevel)}>
              {data.urgencyLevel}
            </Badge>
            {isExpiringSoon() && (
              <div className="flex items-center gap-1 text-warning">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs">Expiring Soon</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {data.digitalSignature && (
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">Digital Signature</span>
                </div>
              )}
              {data.witnessed && (
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600">Witnessed</span>
                </div>
              )}
            </div>

            {data.expiryDate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  Expires: {new Date(data.expiryDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {data.autoExpiry && (
              <div className="text-xs text-muted-foreground">
                ⏰ Auto-expiry enabled
              </div>
            )}
          </div>

          {data.patientId && (
            <div className="text-xs text-muted-foreground">
              Patient: {data.patientId.slice(0, 8)}...
            </div>
          )}
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        id="granted"
        isConnectable={isConnectable}
        className="w-3 h-3"
        style={{ left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="denied"
        isConnectable={isConnectable}
        className="w-3 h-3"
        style={{ left: '75%' }}
      />
    </>
  );
});

ConsentNode.displayName = 'ConsentNode';