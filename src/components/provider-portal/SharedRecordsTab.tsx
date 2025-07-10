
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, FileText } from 'lucide-react';
import SharedRecordsViewer from '../provider/SharedRecordsViewer';

const SharedRecordsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-2 flex items-center">
          <FileText className="h-6 w-6 mr-2 text-autheo-primary" />
          Shared Medical Records
        </h2>
        <p className="text-slate-400">
          View medical records that patients have shared with you after approval.
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All record access is logged for compliance and audit purposes. Only approved records are accessible.
        </AlertDescription>
      </Alert>

      <SharedRecordsViewer />
    </div>
  );
};

export default SharedRecordsTab;
