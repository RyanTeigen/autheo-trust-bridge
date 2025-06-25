
import React, { useState } from 'react';
import { useComplianceMetrics } from '@/hooks/useComplianceMetrics';
import ComplianceScoreCard from '@/components/compliance/overview/ComplianceScoreCard';
import QuickStatusCard from '@/components/compliance/overview/QuickStatusCard';
import MetricsSections from '@/components/compliance/overview/MetricsSections';
import PriorityActionsCard from '@/components/compliance/overview/PriorityActionsCard';
import StatusAlert from '@/components/compliance/overview/StatusAlert';
import AuditAnchorsWidget from '@/components/compliance/AuditAnchorsWidget';

interface ComplianceOverviewTabProps {
  onRunAudit: () => void;
}

const ComplianceOverviewTab: React.FC<ComplianceOverviewTabProps> = ({ onRunAudit }) => {
  const { metrics, loading, refetchMetrics } = useComplianceMetrics();
  const [overallScore, setOverallScore] = useState(92);

  // Update overall score when metrics change
  React.useEffect(() => {
    setOverallScore(metrics.complianceScore);
  }, [metrics.complianceScore]);

  const handleRunAudit = () => {
    onRunAudit();
    refetchMetrics();
  };

  return (
    <div className="space-y-6">
      {/* Compliance Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ComplianceScoreCard 
          score={overallScore}
          loading={loading}
          onRunAudit={handleRunAudit}
        />
        <QuickStatusCard 
          recentErrors={metrics.recentErrors}
          riskLevel={metrics.riskLevel}
          loading={loading}
        />
      </div>

      {/* Metrics Sections */}
      <MetricsSections metrics={metrics} loading={loading} />

      {/* Critical Actions and Blockchain Anchors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriorityActionsCard metrics={metrics} />
        <AuditAnchorsWidget />
      </div>

      {/* Status Alert */}
      <StatusAlert score={overallScore} />
    </div>
  );
};

export default ComplianceOverviewTab;
