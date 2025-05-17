
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Compliance Trends</CardTitle>
        <CardDescription>HIPAA compliance metrics over time</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
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
                
                <Area
                  type="monotone"
                  dataKey="overall"
                  stroke="var(--color-overall)"
                  strokeWidth={2}
                  fill="url(#gradient-overall)"
                />
                <Area
                  type="monotone"
                  dataKey="privacyRule"
                  stroke="var(--color-privacyRule)"
                  strokeWidth={2}
                  fill="url(#gradient-privacyRule)"
                  stackId="1"
                  hide
                />
                <Area
                  type="monotone"
                  dataKey="securityRule"
                  stroke="var(--color-securityRule)"
                  strokeWidth={2}
                  fill="url(#gradient-securityRule)"
                  stackId="1"
                  hide
                />
                <Area
                  type="monotone"
                  dataKey="breachNotification"
                  stroke="var(--color-breachNotification)"
                  strokeWidth={2}
                  fill="url(#gradient-breachNotification)"
                  stackId="1"
                  hide
                />
                <Area
                  type="monotone"
                  dataKey="administrative"
                  stroke="var(--color-administrative)"
                  strokeWidth={2}
                  fill="url(#gradient-administrative)"
                  stackId="1"
                  hide
                />
                <Area
                  type="monotone"
                  dataKey="physical"
                  stroke="var(--color-physical)"
                  strokeWidth={2}
                  fill="url(#gradient-physical)"
                  stackId="1"
                  hide
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceTrendChart;
