
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Lock, Zap, AlertTriangle, CheckCircle, Key } from 'lucide-react';
import { SecurityIndicator } from '@/utils/quantumCrypto';

interface QuantumEncryptionIndicatorProps {
  securityLevel: SecurityIndicator['level'];
  score: number;
  algorithm?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const QuantumEncryptionIndicator: React.FC<QuantumEncryptionIndicatorProps> = ({
  securityLevel,
  score,
  algorithm,
  showDetails = false,
  size = 'md'
}) => {
  const getIndicatorConfig = () => {
    switch (securityLevel) {
      case 'quantum-safe':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Shield className="h-3 w-3" />,
          label: 'Quantum Safe',
          description: 'Protected against quantum computer attacks'
        };
      case 'post-quantum':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Zap className="h-3 w-3" />,
          label: 'Post-Quantum',
          description: 'Uses post-quantum cryptographic algorithms'
        };
      case 'hybrid':
        return {
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <Key className="h-3 w-3" />,
          label: 'Hybrid Security',
          description: 'Combines classical and quantum-resistant methods'
        };
      case 'legacy':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertTriangle className="h-3 w-3" />,
          label: 'Legacy',
          description: 'Vulnerable to quantum attacks - upgrade recommended'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Lock className="h-3 w-3" />,
          label: 'Unknown',
          description: 'Security level could not be determined'
        };
    }
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-3 py-2';
      default: return 'text-xs px-2.5 py-1.5';
    }
  };
  
  const config = getIndicatorConfig();
  
  const IndicatorContent = () => (
    <Badge 
      variant="outline" 
      className={`${config.color} ${getSizeClasses()} flex items-center gap-1 font-medium`}
    >
      {config.icon}
      {config.label}
      {showDetails && score > 0 && (
        <span className="ml-1 font-bold">
          {Math.round(score)}%
        </span>
      )}
    </Badge>
  );
  
  if (showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <IndicatorContent />
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">{config.description}</p>
              {algorithm && (
                <p className="text-xs text-muted-foreground">
                  Algorithm: <span className="font-mono">{algorithm}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Security Score: <span className="font-bold">{Math.round(score)}%</span>
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return <IndicatorContent />;
};

export default QuantumEncryptionIndicator;
