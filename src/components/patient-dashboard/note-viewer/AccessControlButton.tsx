
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';
import { NoteAccessControl } from '../types/note';

interface AccessControlButtonProps {
  providerAccess?: NoteAccessControl;
  onToggleAccess: () => void;
}

const AccessControlButton: React.FC<AccessControlButtonProps> = ({
  providerAccess,
  onToggleAccess
}) => {
  const hasFullAccess = providerAccess?.access_level === 'full';
  
  return (
    <Button 
      size="sm" 
      variant={hasFullAccess ? 'destructive' : 'default'}
      onClick={onToggleAccess}
    >
      {hasFullAccess ? (
        <><Lock className="h-4 w-4 mr-1" /> Revoke Access</>
      ) : (
        <><Unlock className="h-4 w-4 mr-1" /> Grant Access</>
      )}
    </Button>
  );
};

export default AccessControlButton;
