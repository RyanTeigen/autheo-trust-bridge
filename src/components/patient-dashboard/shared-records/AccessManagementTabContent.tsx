
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings } from 'lucide-react';
import SharingManager from '@/components/patient/SharingManager';

const AccessManagementTabContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <Alert className="border-blue-500/30 bg-blue-900/20">
        <Settings className="h-4 w-4" />
        <AlertDescription className="text-slate-200">
          <strong>Access Control:</strong> Manage who has access to your medical records. 
          You can revoke access at any time to maintain complete control over your health data.
        </AlertDescription>
      </Alert>
      
      <SharingManager />
    </div>
  );
};

export default AccessManagementTabContent;
