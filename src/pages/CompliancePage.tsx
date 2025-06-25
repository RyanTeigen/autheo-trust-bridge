
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import CompliancePageHeader from '@/components/compliance/CompliancePageHeader';
import DesktopComplianceView from '@/components/compliance/DesktopComplianceView';
import MobileComplianceView from '@/components/compliance/MobileComplianceView';
import RealTimeComplianceMonitor from '@/components/compliance/RealTimeComplianceMonitor';
import RiskAssessmentEngine from '@/components/compliance/risk-assessment/RiskAssessmentEngine';
import BlockchainAuditTrail from '@/components/compliance/audit-trail/BlockchainAuditTrail';
import QuantumSecurityDashboard from '@/components/security/QuantumSecurityDashboard';
import { AuditLogTable } from '@/components/compliance/AuditLogTable';

const CompliancePage = () => {
  const { toast } = useToast();
  const [complianceScore, setComplianceScore] = useState(92);
  const [showMobileView, setShowMobileView] = useState(false);
  const { profile } = useAuth();
  
  // Check if user has compliance role
  const hasComplianceRole = profile?.roles?.includes('compliance') || profile?.roles?.includes('admin');
  
  // Sample trend data for the compliance trend chart
  const trendData = [
    { date: 'Jan', overall: 84, privacyRule: 90, securityRule: 80, breachNotification: 95, administrative: 75, physical: 70 },
    { date: 'Feb', overall: 86, privacyRule: 92, securityRule: 82, breachNotification: 95, administrative: 78, physical: 74 },
    { date: 'Mar', overall: 88, privacyRule: 94, securityRule: 86, breachNotification: 98, administrative: 80, physical: 75 },
    { date: 'Apr', overall: 90, privacyRule: 96, securityRule: 90, breachNotification: 100, administrative: 80, physical: 75 },
    { date: 'May', overall: 92, privacyRule: 100, securityRule: 94, breachNotification: 100, administrative: 83, physical: 78 },
  ];
  
  // Sample data for the radar chart with previous scores
  const radarData = [
    { subject: 'Privacy', score: 100, fullMark: 100, previousScore: 95 },
    { subject: 'Security', score: 94, fullMark: 100, previousScore: 88 },
    { subject: 'Breach', score: 100, fullMark: 100, previousScore: 100 },
    { subject: 'Admin', score: 83, fullMark: 100, previousScore: 75 },
    { subject: 'Physical', score: 78, fullMark: 100, previousScore: 70 },
  ];
  
  // Desktop/mobile responsive detection
  useEffect(() => {
    const checkForMobile = () => {
      setShowMobileView(window.innerWidth < 768);
    };
    
    checkForMobile();
    window.addEventListener('resize', checkForMobile);
    
    return () => window.removeEventListener('resize', checkForMobile);
  }, []);
  
  const runAudit = () => {
    toast({
      title: "Audit In Progress",
      description: "Running comprehensive compliance audit. This may take a few minutes.",
    });
  };
  
  const handleScoreCalculated = (score: number) => {
    setComplianceScore(score);
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <CompliancePageHeader
          showMobileView={showMobileView}
          onToggleView={() => setShowMobileView(!showMobileView)}
          onRunAudit={runAudit}
          hasComplianceRole={hasComplianceRole}
        />

        {/* Audit Logs Table - New primary component for compliance monitoring */}
        <div className="mb-6">
          <AuditLogTable />
        </div>

        {/* Quantum Security Dashboard - New primary security component */}
        <div className="mb-6">
          <QuantumSecurityDashboard />
        </div>
        
        {/* Real-Time Compliance Monitor - Primary component for live monitoring */}
        <RealTimeComplianceMonitor className="mb-6" />
        
        {/* AI Risk Assessment Engine - For risk analysis */}
        <RiskAssessmentEngine className="mb-6" />
        
        {/* Blockchain Audit Trail - For immutable audit records */}
        <BlockchainAuditTrail className="mb-6" />

        {!showMobileView ? (
          <DesktopComplianceView
            trendData={trendData}
            radarData={radarData}
            complianceScore={complianceScore}
            onScoreCalculated={handleScoreCalculated}
          />
        ) : (
          <MobileComplianceView complianceScore={complianceScore} />
        )}
      </div>
    </div>
  );
};

export default CompliancePage;
