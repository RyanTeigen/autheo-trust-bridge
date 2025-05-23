
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trending1, Trending2, Trending3 } from '@/components/ui/chart';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface ComplianceMetricCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'stable';
  description?: string;
}

const ComplianceMetricCard: React.FC<ComplianceMetricCardProps> = ({
  title,
  score,
  icon,
  trend,
  description
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default:
        return <ArrowRight className="h-4 w-4 text-slate-600" />;
    }
  };
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'bg-green-100 text-green-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${getTrendColor()} mr-3`}>
              {icon}
            </div>
            <span className="font-medium">{title}</span>
          </div>
          <div className="flex items-center text-sm">
            {getTrendIcon()}
            <span className="ml-1">{trend === 'stable' ? 'Stable' : `${trend === 'up' ? '+' : '-'}2%`}</span>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}%</span>
          {description && (
            <span className="text-sm text-muted-foreground mb-1">{description}</span>
          )}
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
          <div 
            className={`h-full ${score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceMetricCard;
