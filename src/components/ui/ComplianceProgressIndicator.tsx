
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ComplianceProgressIndicatorProps {
  score: number;
  className?: string;
}

const ComplianceProgressIndicator: React.FC<ComplianceProgressIndicatorProps> = ({ 
  score, 
  className 
}) => {
  const getColorClass = () => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Compliance Score</span>
        <span className="text-sm font-bold">{score}%</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div 
          className={`h-full absolute top-0 left-0 transition-all ${getColorClass()}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default ComplianceProgressIndicator;
