
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { getVitalStatus, getLatestVitalTrend } from '@/utils/clinicalReferences';

interface VitalStatusIndicatorProps {
  value: number;
  vitalType: string;
  data: Array<{ value: number }>;
  className?: string;
}

export const VitalStatusIndicator: React.FC<VitalStatusIndicatorProps> = ({ 
  value, 
  vitalType, 
  data, 
  className = "" 
}) => {
  const { range, status } = getVitalStatus(value, vitalType);
  const trend = getLatestVitalTrend(data);

  const statusColors = {
    normal: 'bg-green-100 text-green-800 border-green-200',
    borderline: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
    low: 'bg-red-100 text-red-800 border-red-200'
  };

  const trendIcons = {
    improving: <TrendingDown className="h-3 w-3 text-green-600" />,
    worsening: <TrendingUp className="h-3 w-3 text-red-600" />,
    stable: <Minus className="h-3 w-3 text-slate-500" />
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant="outline" 
        className={`${statusColors[status]} text-xs font-medium`}
      >
        {range.label}
      </Badge>
      
      {trend && (
        <div className="flex items-center gap-1">
          {trendIcons[trend]}
        </div>
      )}
      
      {(status === 'high' || status === 'low') && (
        <AlertTriangle className="h-3 w-3 text-amber-500" />
      )}
    </div>
  );
};
