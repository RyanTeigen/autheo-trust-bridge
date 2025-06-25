
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import SharedRecordsContent from '../SharedRecordsContent';

interface OverviewTabContentProps {
  handleShareHealthInfo: () => void;
}

const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ handleShareHealthInfo }) => {
  return (
    <div className="space-y-4">
      <Alert className="border-autheo-primary/30 bg-autheo-primary/10">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-slate-200">
          <strong>Consolidated Experience:</strong> All your sharing and access management tools are now in one place. 
          Choose quantum-safe sharing for maximum security or use standard sharing for traditional needs.
        </AlertDescription>
      </Alert>
      
      <SharedRecordsContent handleShareHealthInfo={handleShareHealthInfo} />
    </div>
  );
};

export default OverviewTabContent;
