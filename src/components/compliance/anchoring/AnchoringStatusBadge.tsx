import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Anchor, Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AnchoringStatusBadgeProps {
  status: 'not_queued' | 'pending' | 'processing' | 'anchored' | 'failed';
  txHash?: string;
  blockNumber?: number;
  anchoredAt?: string;
  errorMessage?: string;
  compact?: boolean;
}

const AnchoringStatusBadge: React.FC<AnchoringStatusBadgeProps> = ({
  status,
  txHash,
  blockNumber,
  anchoredAt,
  errorMessage,
  compact = false
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'anchored':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: compact ? 'Anchored' : 'Blockchain Anchored',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
        };
      case 'processing':
        return {
          variant: 'secondary' as const,
          icon: Loader2,
          text: compact ? 'Processing' : 'Anchoring in Progress',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
        };
      case 'pending':
        return {
          variant: 'outline' as const,
          icon: Clock,
          text: compact ? 'Pending' : 'Queued for Anchoring',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
        };
      case 'failed':
        return {
          variant: 'destructive' as const,
          icon: AlertCircle,
          text: compact ? 'Failed' : 'Anchoring Failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: Anchor,
          text: compact ? 'Not Anchored' : 'Not Queued',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const tooltipContent = () => {
    switch (status) {
      case 'anchored':
        return (
          <div className="space-y-1">
            <div className="font-medium">Successfully Anchored</div>
            {txHash && <div>Tx: {txHash.slice(0, 10)}...</div>}
            {blockNumber && <div>Block: {blockNumber}</div>}
            {anchoredAt && <div>At: {new Date(anchoredAt).toLocaleString()}</div>}
          </div>
        );
      case 'processing':
        return 'Blockchain anchoring is currently in progress';
      case 'pending':
        return 'Queued for blockchain anchoring';
      case 'failed':
        return errorMessage || 'Anchoring process failed';
      default:
        return 'Not queued for blockchain anchoring';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant}
            className={`${config.bgColor} ${config.color} flex items-center gap-1`}
          >
            <Icon 
              size={12} 
              className={status === 'processing' ? 'animate-spin' : ''} 
            />
            {config.text}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AnchoringStatusBadge;