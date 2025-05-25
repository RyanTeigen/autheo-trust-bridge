
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import ComplianceMetricsGrid from './compliance-oversight/ComplianceMetricsGrid';
import ComplianceAlertsList from './compliance-oversight/ComplianceAlertsList';
import ComplianceAuditsCard from './compliance-oversight/ComplianceAuditsCard';
import ComplianceActionsCard from './compliance-oversight/ComplianceActionsCard';

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
      <ComplianceMetricsGrid complianceMetrics={complianceMetrics} />

      {/* Compliance Alerts */}
      <ComplianceAlertsList complianceAlerts={complianceAlerts} />

      {/* Recent Audits and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceAuditsCard recentAudits={recentAudits} />
        <ComplianceActionsCard 
          onGenerateReport={handleGenerateReport}
          onStartAudit={handleStartAudit}
        />
      </div>
    </div>
  );
};

export default ComplianceOversightTab;
