
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  Download,
  Clock,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ComplianceOversightTab: React.FC = () => {
  const { toast } = useToast();

  const complianceMetrics = {
    overallScore: 94,
    hipaaCompliance: 96,
    dataSecurityScore: 92,
    auditReadiness: 88,
    userTrainingComplete: 87
  };

  const recentAudits = [
    {
      id: '1',
      type: 'HIPAA Security Rule',
      date: '2024-05-20',
      status: 'completed',
      score: 96,
      findings: 2
    },
    {
      id: '2',
      type: 'Data Encryption Audit',
      date: '2024-05-18',
      status: 'completed',
      score: 98,
      findings: 0
    },
    {
      id: '3',
      type: 'Access Control Review',
      date: '2024-05-15',
      status: 'in-progress',
      score: null,
      findings: null
    }
  ];

  const complianceAlerts = [
    {
      id: '1',
      severity: 'medium',
      message: '12 staff members need to complete annual HIPAA training',
      deadline: '2024-06-01'
    },
    {
      id: '2',
      severity: 'low',
      message: 'Security risk assessment due for annual review',
      deadline: '2024-06-15'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleGenerateReport = () => {
    toast({
      title: "Compliance Report Generated",
      description: "Comprehensive compliance report is being prepared for download.",
    });
  };

  const handleStartAudit = () => {
    toast({
      title: "Audit Initiated",
      description: "New compliance audit has been started. You will be notified when complete.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Compliance Score Overview */}
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

      {/* Compliance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Compliance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceAlerts.map((alert) => (
              <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs mt-1">Deadline: {alert.deadline}</p>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Audits and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAudits.map((audit) => (
                <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{audit.type}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {audit.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(audit.status)}>
                      {audit.status}
                    </Badge>
                    {audit.score && (
                      <p className="text-sm font-medium mt-1">{audit.score}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Compliance Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGenerateReport}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Compliance Report
            </Button>
            
            <Button 
              onClick={handleStartAudit}
              className="w-full justify-start"
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Start New Audit
            </Button>
            
            <Button 
              className="w-full justify-start"
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Schedule Training Session
            </Button>
            
            <Button 
              className="w-full justify-start"
              variant="outline"
            >
              <Shield className="h-4 w-4 mr-2" />
              Review Security Policies
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplianceOversightTab;
