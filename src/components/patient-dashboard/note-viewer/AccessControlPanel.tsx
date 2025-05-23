
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { NoteAccessControl, AuditLogEntry } from '../types/note';

import AccessStatusBadge from './AccessStatusBadge';
import AccessHistoryList from './AccessHistoryList';
import AccessControlButton from './AccessControlButton';

interface AccessControlPanelProps {
  noteId: string;
  providerId: string;
  providerAccess?: NoteAccessControl;
  accessHistory: AuditLogEntry[];
  onToggleAccess: (providerId: string, currentAccess: string) => void;
}

const AccessControlPanel: React.FC<AccessControlPanelProps> = ({
  providerId,
  providerAccess,
  accessHistory,
  onToggleAccess,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="border rounded-md p-4 bg-slate-50 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <Shield className="h-4 w-4 mr-2 text-blue-600" /> Provider Access
        </h3>
        <div className="flex gap-2">
          <AccessStatusBadge 
            providerAccess={providerAccess}
            onToggleAccess={() => onToggleAccess(providerId, providerAccess?.access_level || 'revoked')}
          />
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Hide History" : "View History"}
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Control who can access this medical record and for how long.
      </p>
      
      {/* Access History */}
      {showHistory && accessHistory.length > 0 && (
        <AccessHistoryList accessHistory={accessHistory} />
      )}
      
      <div className="flex justify-end">
        <AccessControlButton
          providerAccess={providerAccess}
          onToggleAccess={() => onToggleAccess(providerId, providerAccess?.access_level || 'revoked')}
        />
      </div>
    </div>
  );
};

export default AccessControlPanel;
