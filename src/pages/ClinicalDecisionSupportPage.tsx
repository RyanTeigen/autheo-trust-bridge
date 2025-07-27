import React from 'react';
import { Brain } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import ClinicalDecisionSupport from '@/components/clinical/ClinicalDecisionSupport';

const ClinicalDecisionSupportPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Decision Support"
        description="AI-powered clinical insights and evidence-based recommendations"
        icon={<Brain className="h-8 w-8 text-blue-600" />}
      />
      
      <ClinicalDecisionSupport />
    </div>
  );
};

export default ClinicalDecisionSupportPage;