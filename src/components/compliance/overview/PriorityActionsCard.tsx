
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface ComplianceMetrics {
  recentErrors: number;
  accessDeniedCount: number;
}

interface PriorityActionsCardProps {
  metrics: ComplianceMetrics;
}

const PriorityActionsCard: React.FC<PriorityActionsCardProps> = ({ metrics }) => {
  const criticalActions = [
    {
      title: 'Update Risk Assessment',
      description: 'Annual security risk assessment needs update',
      priority: 'high',
      dueDate: 'Due in 7 days'
    },
    {
      title: 'Security Training',
      description: '12 staff members need to complete training',
      priority: 'medium',
      dueDate: 'Due in 2 weeks'
    },
    {
      title: 'Review Recent Errors',
      description: `${metrics.recentErrors} errors logged in the last 24 hours`,
      priority: metrics.recentErrors > 5 ? 'high' : 'low',
      dueDate: 'Immediate attention needed'
    },
    {
      title: 'Review Access Denials',
      description: `${metrics.accessDeniedCount} access attempts denied in the last 30 days`,
      priority: metrics.accessDeniedCount > 20 ? 'high' : 'medium',
      dueDate: 'Review security logs'
    }
  ];

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl text-autheo-primary flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Priority Actions Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {criticalActions.map((action, index) => (
            <div key={index} className="flex items-start justify-between p-4 border border-slate-600 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-slate-100">{action.title}</h4>
                  <Badge 
                    variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'secondary' : 'outline'}
                    className={action.priority === 'medium' ? 'bg-amber-100 text-amber-800' : ''}
                  >
                    {action.priority}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mb-2">{action.description}</p>
                <p className="text-xs text-slate-500">{action.dueDate}</p>
              </div>
              <Button size="sm" className="ml-4 bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900">
                Take Action
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriorityActionsCard;
