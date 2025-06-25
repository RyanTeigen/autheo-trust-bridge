
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CompliancePageHeaderProps {
  showMobileView: boolean;
  onToggleView: () => void;
  onRunAudit: () => void;
  hasComplianceRole: boolean;
}

const CompliancePageHeader: React.FC<CompliancePageHeaderProps> = ({
  showMobileView,
  onToggleView,
  onRunAudit,
  hasComplianceRole
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-100">HIPAA Compliance</h1>
          <p className="text-slate-300">
            Real-time compliance monitoring and audit controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onToggleView}
            className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
          >
            {showMobileView ? "Desktop View" : "Mobile View"}
          </Button>
          <Button 
            onClick={onRunAudit}
            className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
          >
            Run Audit
          </Button>
        </div>
      </div>

      {!hasComplianceRole && (
        <Alert className="mb-4 bg-amber-900/20 border-amber-500/30 text-amber-200">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>
            You are accessing this page with creator privileges. Normally, this page is restricted to users with compliance or admin roles.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CompliancePageHeader;
