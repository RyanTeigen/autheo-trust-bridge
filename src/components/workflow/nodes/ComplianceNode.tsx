import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface ComplianceNodeData {
  complianceType: 'hipaa' | 'gdpr' | 'audit' | 'security-check' | 'data-retention' | 'breach-notification';
  status: 'compliant' | 'non-compliant' | 'pending-review' | 'requires-action' | 'expired';
  lastChecked?: string;
  nextReview?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  automated: boolean;
  requiresDocumentation: boolean;
  violations?: number;
}

interface ComplianceNodeProps {
  data: ComplianceNodeData;
  isConnectable: boolean;
}

export const ComplianceNode = memo(({ data, isConnectable }: ComplianceNodeProps) => {
  const getComplianceIcon = (type: string) => {
    switch (type) {
      case 'hipaa': return '🏥';
      case 'gdpr': return '🇪🇺';
      case 'audit': return '📊';
      case 'security-check': return '🔒';
      case 'data-retention': return '📁';
      case 'breach-notification': return '🚨';
      default: return '⚖️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-success';
      case 'non-compliant': return 'bg-destructive';
      case 'requires-action': return 'bg-warning';
      case 'expired': return 'bg-destructive';
      default: return 'bg-warning';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'non-compliant': return <AlertTriangle className="w-3 h-3 text-red-600" />;
      case 'requires-action': return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      default: return <Clock className="w-3 h-3 text-blue-600" />;
    }
  };

  const isReviewDue = () => {
    if (!data.nextReview) return false;
    const reviewDate = new Date(data.nextReview);
    const today = new Date();
    return reviewDate <= today;
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      
      <Card className="w-80 border-warning/20 bg-warning/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-warning" />
            <CardTitle className="text-sm">Compliance Check</CardTitle>
            <span className="text-xs">{getComplianceIcon(data.complianceType)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {data.complianceType.replace('-', ' ').toUpperCase()}
            </Badge>
            <Badge variant="secondary" className={getStatusColor(data.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(data.status)}
                {data.status}
              </div>
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getRiskColor(data.riskLevel)}>
              {data.riskLevel} risk
            </Badge>
            {data.automated && (
              <Badge variant="outline" className="text-xs">
                ⚙️ Automated
              </Badge>
            )}
          </div>

          {data.violations && data.violations > 0 && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs">{data.violations} violation(s) found</span>
            </div>
          )}

          {isReviewDue() && (
            <div className="flex items-center gap-1 text-warning">
              <Clock className="w-3 h-3" />
              <span className="text-xs">Review overdue</span>
            </div>
          )}

          <div className="space-y-1">
            {data.lastChecked && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  Last checked: {new Date(data.lastChecked).toLocaleDateString()}
                </span>
              </div>
            )}

            {data.nextReview && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  Next review: {new Date(data.nextReview).toLocaleDateString()}
                </span>
              </div>
            )}

            {data.requiresDocumentation && (
              <div className="text-xs text-warning">
                📄 Documentation required
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        id="compliant"
        isConnectable={isConnectable}
        className="w-3 h-3"
        style={{ left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="non-compliant"
        isConnectable={isConnectable}
        className="w-3 h-3"
        style={{ left: '75%' }}
      />
    </>
  );
});

ComplianceNode.displayName = 'ComplianceNode';