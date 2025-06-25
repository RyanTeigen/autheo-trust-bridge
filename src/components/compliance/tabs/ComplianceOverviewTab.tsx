
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import ComplianceProgressIndicator from '@/components/ui/ComplianceProgressIndicator';
import { MetricCard } from '@/components/ui/metric-card';

interface ComplianceOverviewTabProps {
  onRunAudit: () => void;
}

const ComplianceOverviewTab: React.FC<ComplianceOverviewTabProps> = ({ onRunAudit }) => {
  const [overallScore] = useState(92);
  
  // Key metrics data
  const keyMetrics = [
    { title: 'Privacy Rule', value: '100%', trend: 'up', icon: <Shield className="h-4 w-4" /> },
    { title: 'Security Rule', value: '94%', trend: 'stable', icon: <Shield className="h-4 w-4" /> },
    { title: 'Administrative', value: '83%', trend: 'down', icon: <AlertTriangle className="h-4 w-4" /> },
    { title: 'Physical Safeguards', value: '78%', trend: 'up', icon: <CheckCircle className="h-4 w-4" /> },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-slate-400" />;
    }
  };

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
    }
  ];

  return (
    <div className="space-y-6">
      {/* Compliance Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-autheo-primary flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Overall Compliance Score
              </CardTitle>
              <Badge 
                variant="outline" 
                className="bg-green-600/20 text-green-400 border-green-500/30"
              >
                {overallScore}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ComplianceProgressIndicator score={overallScore} />
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Last assessment: June 20, 2025</span>
                <Button onClick={onRunAudit} size="sm" className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900">
                  Run New Audit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-autheo-primary">Quick Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Active Alerts</span>
              <Badge variant="destructive">2</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Pending Actions</span>
              <Badge variant="outline" className="bg-amber-100 text-amber-800">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Next Audit</span>
              <span className="text-sm text-slate-400">Q3 2025</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {metric.icon}
                  <span className="text-sm font-medium text-slate-300">{metric.title}</span>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-autheo-primary">{metric.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Actions */}
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
                      variant={action.priority === 'high' ? 'destructive' : 'secondary'}
                      className={action.priority === 'high' ? '' : 'bg-amber-100 text-amber-800'}
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

      {/* Status Alert */}
      <Alert className="bg-green-900/20 border-green-500/30">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="text-green-200">
          Your organization maintains a strong compliance posture. Continue monitoring critical areas for improvement.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ComplianceOverviewTab;
