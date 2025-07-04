
import React from 'react';
import RealTimeComplianceMonitor from '@/components/compliance/RealTimeComplianceMonitor';
import QuantumSecurityDashboard from '@/components/security/QuantumSecurityDashboard';
import ComplianceQuantumScoreCard from '@/components/compliance/ComplianceQuantumScoreCard';

const ComplianceMonitoringTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Real-Time Monitoring</h2>
        <p className="text-slate-300">
          Live monitoring of security events, access patterns, and compliance metrics
        </p>
      </div>
      
      {/* Quantum Security Score */}
      <ComplianceQuantumScoreCard />
      
      <RealTimeComplianceMonitor />
      <QuantumSecurityDashboard />
    </div>
  );
};

export default ComplianceMonitoringTab;
