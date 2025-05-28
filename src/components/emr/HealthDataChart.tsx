
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer } from '@/components/ui/chart';

export interface HealthDataPoint {
  date: string;
  value: number;
}

export interface HealthDataChartProps {
  title: string;
  description?: string;
  data: HealthDataPoint[];
  dataKey?: string;
  unit?: string;
  color?: string;
  minValue?: number;
  maxValue?: number;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

const HealthDataChart: React.FC<HealthDataChartProps> = ({
  title,
  description,
  data,
  dataKey = 'value',
  unit = '',
  color = "#9b87f5",
  minValue,
  maxValue,
  timeRange = '1m',
  onTimeRangeChange
}) => {
  // Format date for x-axis display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // Format tooltip date display
  const formatTooltipDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Calculate domain padding for better visual appearance
  const calculateDomain = () => {
    if (minValue !== undefined && maxValue !== undefined) {
      // Apply 5% padding to the domain
      const range = maxValue - minValue;
      const padding = range * 0.1;
      return [minValue - padding, maxValue + padding];
    }
    return ['auto', 'auto'];
  };
  
  return (
    <Card className="bg-slate-800/50 border-slate-700 w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-slate-100 truncate">{title}</CardTitle>
            {description && <CardDescription className="text-slate-400 text-sm">{description}</CardDescription>}
          </div>
          {onTimeRangeChange && (
            <div className="flex-shrink-0 ml-4">
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-[120px] bg-slate-700/50 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectItem value="1w" className="text-slate-200 focus:bg-slate-700 focus:text-white">Last week</SelectItem>
                  <SelectItem value="1m" className="text-slate-200 focus:bg-slate-700 focus:text-white">Last month</SelectItem>
                  <SelectItem value="3m" className="text-slate-200 focus:bg-slate-700 focus:text-white">Last 3 months</SelectItem>
                  <SelectItem value="1y" className="text-slate-200 focus:bg-slate-700 focus:text-white">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="w-full h-[280px] min-h-[280px]">
          <ChartContainer
            config={{
              data: { color },
            }}
            className="w-full h-full"
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={300}>
              <LineChart
                data={data}
                margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  padding={{ left: 10, right: 10 }}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  stroke="#475569"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={calculateDomain()}
                  tickFormatter={(value) => `${value}${unit}`}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  stroke="#475569"
                  width={50}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    
                    const data = payload[0].payload as HealthDataPoint;
                    return (
                      <div className="rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-md">
                        <div className="text-sm font-medium text-slate-300">{formatTooltipDate(data.date)}</div>
                        <div className="text-sm font-semibold" style={{ color }}>
                          {data.value}{unit}
                        </div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 1, fill: '#1e293b' }}
                  activeDot={{ r: 6, strokeWidth: 1, fill: '#1e293b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthDataChart;
