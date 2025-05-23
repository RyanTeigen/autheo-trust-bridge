
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Clock, Lock, Unlock } from 'lucide-react';
import { NoteAccessControl, AuditLogEntry } from '../types/note';

interface AccessControlPanelProps {
  noteId: string;
  providerId: string;
  providerAccess?: NoteAccessControl;
  accessHistory: AuditLogEntry[];
  onToggleAccess: (providerId: string, currentAccess: string) => void;
}

const AccessControlPanel: React.FC<AccessControlPanelProps> = ({
  noteId,
  providerId,
  providerAccess,
  accessHistory,
  onToggleAccess,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="border rounded-md p-4 bg-slate-50 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <Shield className="h-4 w-4 mr-2 text-blue-600" /> Provider Access
        </h3>
        <div className="flex gap-2">
          {providerAccess ? (
            providerAccess.access_level === 'full' ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer" onClick={() => onToggleAccess(providerId, providerAccess.access_level)}>
                <Eye className="h-3.5 w-3.5 mr-1" /> Full Access
              </Badge>
            ) : providerAccess.access_level === 'temporary' ? (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer" onClick={() => onToggleAccess(providerId, providerAccess.access_level)}>
                <Clock className="h-3.5 w-3.5 mr-1" /> Temporary Access
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors cursor-pointer" onClick={() => onToggleAccess(providerId, providerAccess.access_level)}>
                <EyeOff className="h-3.5 w-3.5 mr-1" /> Access Revoked
              </Badge>
            )
          ) : (
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              <Clock className="h-3.5 w-3.5 mr-1" /> Status Unknown
            </Badge>
          )}
          
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
        <div className="mt-4 border rounded-md p-3 bg-white">
          <h4 className="font-medium text-sm mb-2">Access History</h4>
          <div className="space-y-2 max-h-[120px] overflow-y-auto text-xs">
            {accessHistory.map((entry) => (
              <div key={entry.id} className="flex justify-between border-b pb-1 last:border-0">
                <div>
                  {entry.action === 'grant_access' ? (
                    <span className="text-green-600">✓ Access granted</span>
                  ) : (
                    <span className="text-red-600">✗ Access revoked</span>
                  )}
                </div>
                <div className="text-slate-500">
                  {formatDate(entry.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button 
          size="sm" 
          variant={providerAccess?.access_level === 'full' ? 'destructive' : 'default'}
          onClick={() => onToggleAccess(providerId, providerAccess?.access_level || 'revoked')}
        >
          {providerAccess?.access_level === 'full' ? (
            <><Lock className="h-4 w-4 mr-1" /> Revoke Access</>
          ) : (
            <><Unlock className="h-4 w-4 mr-1" /> Grant Access</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AccessControlPanel;
