import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HealthDataPoint {
  date: string;
  value: number;
  type: string;
}

interface HealthChartProps {
  data: HealthDataPoint[];
  title: string;
  color: string;
  unit: string;
  icon: React.ReactNode;
  showTrend?: boolean;
}

const HealthChart: React.FC<HealthChartProps> = ({ 
  data, 
  title, 
  color, 
  unit, 
  icon, 
  showTrend = true 
}) => {
  // Calculate trend
  const getTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const latest = data[data.length - 1]?.value || 0;
    const previous = data[data.length - 2]?.value || 0;
    
    if (latest > previous) {
      const percentage = ((latest - previous) / previous) * 100;
      return { direction: 'up', percentage: Math.abs(percentage) };
    } else if (latest < previous) {
      const percentage = ((previous - latest) / previous) * 100;
      return { direction: 'down', percentage: Math.abs(percentage) };
    }
    
    return { direction: 'stable', percentage: 0 };
  };

  const trend = getTrend();
  
  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {showTrend && data.length > 1 && (
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {trend.percentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                fontSize={12}
                tickFormatter={(value) => `${value} ${unit}`}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`${value} ${unit}`, title]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {data.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Latest</p>
              <p className="font-semibold">
                {data[data.length - 1]?.value} {unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="font-semibold">
                {(data.reduce((sum, point) => sum + point.value, 0) / data.length).toFixed(1)} {unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Readings</p>
              <p className="font-semibold">{data.length}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthChart;