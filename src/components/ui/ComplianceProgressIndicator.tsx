
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
  const getColor = () => {
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
      <Progress 
        value={score} 
        className="h-2" 
        indicatorClassName={getColor()} 
      />
    </div>
  );
};

export default ComplianceProgressIndicator;
