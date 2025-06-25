
import React from 'react';
import { Share2 } from 'lucide-react';
import { ShareManager } from '@/components/medical/sharing/ShareManager';

const StandardSharingTabContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-400">Standard Record Sharing</h3>
        </div>
        <p className="text-slate-300 text-sm">
          Use the standard sharing system to manage access to your medical records with healthcare providers. 
          This system provides secure access control with traditional encryption methods.
        </p>
      </div>
      
      <ShareManager />
    </div>
  );
};

export default StandardSharingTabContent;
