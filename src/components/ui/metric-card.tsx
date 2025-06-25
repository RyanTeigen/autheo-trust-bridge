
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: React.ReactNode;
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend,
  description 
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-1">
          <div className="h-4 w-4 text-autheo-primary">
            {icon}
          </div>
          {trend && trend}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-autheo-primary">{value}</div>
        {description && (
          <p className="text-xs text-slate-400 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
