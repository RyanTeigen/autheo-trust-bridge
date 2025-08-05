import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, AlertTriangle } from 'lucide-react';

interface DecisionNodeData {
  condition: string;
  description?: string;
  type: 'manual' | 'automatic' | 'conditional';
  criteria?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface DecisionNodeProps {
  data: DecisionNodeData;
  isConnectable: boolean;
}

export const DecisionNode = memo(({ data, isConnectable }: DecisionNodeProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'automatic': return '⚙️';
      case 'conditional': return '🔍';
      default: return '👤';
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
      
      <Card className="w-64 border-warning/20 bg-warning/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-warning" />
            <CardTitle className="text-sm">Decision Point</CardTitle>
            <span className="text-xs">{getTypeIcon(data.type)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getPriorityColor(data.priority)}>
              {data.priority}
            </Badge>
            {data.priority === 'urgent' && (
              <AlertTriangle className="w-3 h-3 text-destructive" />
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">{data.condition}</p>
            {data.description && (
              <p className="text-xs text-muted-foreground">{data.description}</p>
            )}
          </div>

          {data.criteria && data.criteria.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium">Criteria:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {data.criteria.slice(0, 2).map((criterion, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{criterion}</span>
                  </li>
                ))}
                {data.criteria.length > 2 && (
                  <li className="text-xs text-muted-foreground">
                    +{data.criteria.length - 2} more...
                  </li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Multiple output handles for different decision paths */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        isConnectable={isConnectable}
        className="w-3 h-3"
        style={{ left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        isConnectable={isConnectable}
        className="w-3 h-3"
        style={{ left: '75%' }}
      />
    </>
  );
});

DecisionNode.displayName = 'DecisionNode';