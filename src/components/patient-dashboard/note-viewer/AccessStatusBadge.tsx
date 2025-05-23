
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Clock } from 'lucide-react';
import { NoteAccessControl } from '../types/note';

interface AccessStatusBadgeProps {
  providerAccess?: NoteAccessControl;
  onToggleAccess: () => void;
}

const AccessStatusBadge: React.FC<AccessStatusBadgeProps> = ({ 
  providerAccess,
  onToggleAccess
}) => {
  if (!providerAccess) {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-800">
        <Clock className="h-3.5 w-3.5 mr-1" /> Status Unknown
      </Badge>
    );
  }

  if (providerAccess.access_level === 'full') {
    return (
      <Badge 
        className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer" 
        onClick={onToggleAccess}
      >
        <Eye className="h-3.5 w-3.5 mr-1" /> Full Access
      </Badge>
    );
  } 
  
  if (providerAccess.access_level === 'temporary') {
    return (
      <Badge 
        variant="outline" 
        className="bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer"
        onClick={onToggleAccess}
      >
        <Clock className="h-3.5 w-3.5 mr-1" /> Temporary Access
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant="outline" 
      className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors cursor-pointer"
      onClick={onToggleAccess}
    >
      <EyeOff className="h-3.5 w-3.5 mr-1" /> Access Revoked
    </Badge>
  );
};

export default AccessStatusBadge;
