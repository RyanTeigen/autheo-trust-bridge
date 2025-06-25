
import React from 'react';
import ComplianceTrendChart from './ComplianceTrendChart';
import ComplianceRadarChart from './ComplianceRadarChart';
import ComplianceScoreCalculator from './ComplianceScoreCalculator';
import ComplianceActionsCard from './ComplianceActionsCard';
import ComplianceRecommendations from './ComplianceRecommendations';
import ZeroKnowledgeVerification from './ZeroKnowledgeVerification';

interface DesktopComplianceViewProps {
  trendData: any[];
  radarData: any[];
  complianceScore: number;
  onScoreCalculated: (score: number) => void;
}

const DesktopComplianceView: React.FC<DesktopComplianceViewProps> = ({
  trendData,
  radarData,
  complianceScore,
  onScoreCalculated
}) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ComplianceTrendChart data={trendData} />
        <ComplianceRadarChart data={radarData} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ComplianceScoreCalculator 
          className="lg:col-span-1"
          onScoreCalculated={onScoreCalculated}
        />
        
        <ComplianceActionsCard complianceScore={complianceScore} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ComplianceRecommendations />
        </div>
        <div className="lg:col-span-1">
          <ZeroKnowledgeVerification />
        </div>
      </div>
    </>
  );
};

export default DesktopComplianceView;
