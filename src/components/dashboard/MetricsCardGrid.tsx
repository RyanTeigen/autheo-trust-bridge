
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MetricItem {
  name: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  date: string;
}

interface MetricsCardGridProps {
  metrics: MetricItem[];
}

const MetricsCardGrid: React.FC<MetricsCardGridProps> = ({ metrics }) => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {metrics.map((metric, idx) => (
        <Card key={idx} className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-3">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-autheo-primary">{metric.name}</h3>
              <Badge variant={metric.trend === 'up' ? 'outline' : 'secondary'} className="text-xs">
                {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
              </Badge>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-xl font-bold text-slate-100">{metric.value}</span>
              <span className="text-xs text-slate-300">{metric.unit}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Recorded: {metric.date}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsCardGrid;
