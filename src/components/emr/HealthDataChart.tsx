
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
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

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
  
  // Format value for tooltip display
  const formatValue = (value: number) => {
    return `${value}${unit}`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {onTimeRangeChange && (
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1w">Last week</SelectItem>
                <SelectItem value="1m">Last month</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              data: { color },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  domain={[minValue || 'auto', maxValue || 'auto']}
                  tickFormatter={(value) => `${value}${unit}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-sm font-medium">{new Date(data.date).toLocaleDateString()}</div>
                        <div className="text-sm font-semibold text-primary">
                          {formatValue(data.value)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
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
