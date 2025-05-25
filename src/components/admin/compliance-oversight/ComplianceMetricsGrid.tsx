
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  FileText, 
  Eye,
  Users
} from 'lucide-react';

interface ComplianceMetrics {
  overallScore: number;
  hipaaCompliance: number;
  dataSecurityScore: number;
  auditReadiness: number;
  userTrainingComplete: number;
}

interface ComplianceMetricsGridProps {
  complianceMetrics: ComplianceMetrics;
}

const ComplianceMetricsGrid: React.FC<ComplianceMetricsGridProps> = ({ complianceMetrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceMetrics.overallScore}%</div>
          <Progress value={complianceMetrics.overallScore} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">HIPAA</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceMetrics.hipaaCompliance}%</div>
          <Progress value={complianceMetrics.hipaaCompliance} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Data Security</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceMetrics.dataSecurityScore}%</div>
          <Progress value={complianceMetrics.dataSecurityScore} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Audit Ready</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceMetrics.auditReadiness}%</div>
          <Progress value={complianceMetrics.auditReadiness} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Training</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceMetrics.userTrainingComplete}%</div>
          <Progress value={complianceMetrics.userTrainingComplete} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceMetricsGrid;
