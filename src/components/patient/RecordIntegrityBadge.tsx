
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

interface RecordIntegrityBadgeProps {
  integrity: {
    hasHash: boolean;
    isAnchored: boolean;
    anchoredAt?: string;
    anchoringInProgress?: boolean;
  };
  className?: string;
}

export function RecordIntegrityBadge({ integrity, className }: RecordIntegrityBadgeProps) {
  if (!integrity.hasHash) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`text-slate-400 border-slate-600 ${className}`}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              No Hash
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>This record does not have a cryptographic hash for integrity verification</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (integrity.anchoringInProgress) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`text-blue-400 border-blue-600 ${className}`}>
              <Clock className="h-3 w-3 mr-1 animate-spin" />
              Anchoring
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Record hash is being anchored to blockchain for tamper-proof verification</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (integrity.isAnchored) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`text-green-400 border-green-600 ${className}`}>
              <ShieldCheck className="h-3 w-3 mr-1" />
              Anchored
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Record hash is cryptographically anchored to blockchain
              {integrity.anchoredAt && (
                <><br />Anchored: {new Date(integrity.anchoredAt).toLocaleString()}</>
              )}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={`text-yellow-400 border-yellow-600 ${className}`}>
            <Shield className="h-3 w-3 mr-1" />
            Hashed
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Record has cryptographic hash but is not yet anchored to blockchain</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
