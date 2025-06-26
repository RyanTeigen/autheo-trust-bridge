
import React from 'react';
import ZeroKnowledgeVerification from '../ZeroKnowledgeVerification';
import BlockchainAnchoringStatus from '../BlockchainAnchoringStatus';

const ComplianceToolsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Blockchain Anchoring Status */}
      <BlockchainAnchoringStatus />
      
      {/* Zero-Knowledge Verification */}
      <ZeroKnowledgeVerification />
    </div>
  );
};

export default ComplianceToolsTab;
