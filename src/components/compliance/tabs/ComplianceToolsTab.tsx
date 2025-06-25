
import React, { useState } from 'react';
import ComplianceScoreCalculator from '@/components/compliance/ComplianceScoreCalculator';
import RiskAssessmentEngine from '@/components/compliance/risk-assessment/RiskAssessmentEngine';
import ZeroKnowledgeVerification from '@/components/compliance/ZeroKnowledgeVerification';

const ComplianceToolsTab: React.FC = () => {
  const [calculatedScore, setCalculatedScore] = useState(92);

  const handleScoreCalculated = (score: number) => {
    setCalculatedScore(score);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Compliance Tools</h2>
        <p className="text-slate-300">
          Interactive tools for compliance assessment, risk analysis, and verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceScoreCalculator 
          onScoreCalculated={handleScoreCalculated}
        />
        <ZeroKnowledgeVerification />
      </div>
      
      <RiskAssessmentEngine />
    </div>
  );
};

export default ComplianceToolsTab;
