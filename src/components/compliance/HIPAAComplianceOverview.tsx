import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { useHIPAACompliance } from '@/hooks/useHIPAACompliance';

const HIPAAComplianceOverview: React.FC = () => {
  const { complianceStatus, loading } = useHIPAACompliance();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!complianceStatus) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No compliance data available</p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(complianceStatus.overall_score)}`}>
              {complianceStatus.overall_score}%
            </div>
            <Progress 
              value={complianceStatus.overall_score} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {complianceStatus.implemented_controls} of {complianceStatus.total_controls} controls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {complianceStatus.critical_findings}
            </div>
            <Badge variant={complianceStatus.critical_findings > 0 ? 'destructive' : 'default'} className="mt-2">
              {complianceStatus.critical_findings > 0 ? 'Action Required' : 'No Issues'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Gaps</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {complianceStatus.high_risk_gaps}
            </div>
            <Badge variant={complianceStatus.high_risk_gaps > 0 ? 'secondary' : 'default'} className="mt-2">
              {complianceStatus.high_risk_gaps > 0 ? 'Review Needed' : 'All Clear'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {complianceStatus.last_assessment 
                ? new Date(complianceStatus.last_assessment).toLocaleDateString()
                : 'Never'
              }
            </div>
            <Badge variant="outline" className="mt-2">
              {complianceStatus.last_assessment ? 'Up to Date' : 'Overdue'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Next Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Priority Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {complianceStatus.next_actions.length > 0 ? (
            <ul className="space-y-2">
              {complianceStatus.next_actions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No immediate actions required</p>
          )}
        </CardContent>
      </Card>

      {/* Compliance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Last 30 Days</p>
              <div className="flex items-center gap-2">
                <Progress value={complianceStatus.compliance_trends.last_30_days} className="flex-1" />
                <span className="text-sm font-medium">{complianceStatus.compliance_trends.last_30_days}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Last 90 Days</p>
              <div className="flex items-center gap-2">
                <Progress value={complianceStatus.compliance_trends.last_90_days} className="flex-1" />
                <span className="text-sm font-medium">{complianceStatus.compliance_trends.last_90_days}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HIPAAComplianceOverview;