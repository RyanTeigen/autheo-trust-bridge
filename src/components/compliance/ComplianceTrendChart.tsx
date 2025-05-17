
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ComplianceMetric {
  date: string;
  privacyRule: number;
  securityRule: number;
  breachNotification: number;
  administrative: number;
  physical: number;
  overall: number;
}

interface ComplianceTrendChartProps {
  data: ComplianceMetric[];
  className?: string;
}

const ComplianceTrendChart: React.FC<ComplianceTrendChartProps> = ({ data, className }) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['overall']);
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | 'all'>('6m');
  
  // Filter data based on time range
  const filteredData = React.useMemo(() => {
    if (timeRange === 'all') return data;
    
    const now = new Date();
    const monthsToGoBack = timeRange === '6m' ? 6 : 12;
    const cutoffDate = new Date(now.setMonth(now.getMonth() - monthsToGoBack));
    
    // This is a simplified filter that assumes the dates are in chronological order
    return data.slice(-monthsToGoBack);
  }, [data, timeRange]);
  
  // Configuration for the chart colors and labels
  const chartConfig = {
    overall: {
      label: "Overall",
      theme: {
        light: "#2563eb",
        dark: "#3b82f6",
      },
    },
    privacyRule: {
      label: "Privacy Rule",
      theme: {
        light: "#16a34a",
        dark: "#22c55e",
      },
    },
    securityRule: {
      label: "Security Rule",
      theme: {
        light: "#ea580c",
        dark: "#f97316",
      },
    },
    breachNotification: {
      label: "Breach",
      theme: {
        light: "#6366f1",
        dark: "#818cf8",
      },
    },
    administrative: {
      label: "Admin",
      theme: {
        light: "#d97706",
        dark: "#f59e0b",
      },
    },
    physical: {
      label: "Physical",
      theme: {
        light: "#7c3aed",
        dark: "#8b5cf6",
      },
    },
  };

  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Compliance Trends</CardTitle>
          <CardDescription>HIPAA compliance metrics over time</CardDescription>
        </div>
        <div className="flex gap-1">
          <Button 
            variant={timeRange === '6m' ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setTimeRange('6m')}
          >
            6M
          </Button>
          <Button 
            variant={timeRange === '1y' ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setTimeRange('1y')}
          >
            1Y
          </Button>
          <Button 
            variant={timeRange === 'all' ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setTimeRange('all')}
          >
            All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox 
                id={`metric-${key}`} 
                checked={selectedMetrics.includes(key)}
                onCheckedChange={() => toggleMetric(key)}
              />
              <Label 
                htmlFor={`metric-${key}`}
                className="text-sm flex items-center gap-1"
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: config.theme.light }}
                ></div>
                {config.label}
              </Label>
            </div>
          ))}
        </div>
        
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  {Object.entries(chartConfig).map(([key, config]) => (
                    <linearGradient
                      key={key}
                      id={`gradient-${key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={`var(--color-${key})`}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={`var(--color-${key})`}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                
                <ChartTooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent 
                      active={active} 
                      payload={payload} 
                      formatter={(value) => `${value}%`}
                    />
                  )}
                />
                
                {Object.keys(chartConfig).map((key) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={`var(--color-${key})`}
                    strokeWidth={2}
                    fill={`url(#gradient-${key})`}
                    hide={!selectedMetrics.includes(key)}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceTrendChart;
