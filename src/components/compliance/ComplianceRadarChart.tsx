
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

interface ComplianceDomain {
  subject: string;
  score: number;
  fullMark: number;
}

interface ComplianceRadarChartProps {
  data: ComplianceDomain[];
  className?: string;
}

const ComplianceRadarChart: React.FC<ComplianceRadarChartProps> = ({ data, className }) => {
  const chartConfig = {
    score: {
      label: "Compliance Score",
      theme: {
        light: "#2563eb",
        dark: "#3b82f6",
      },
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Compliance Coverage</CardTitle>
        <CardDescription>HIPAA compliance across domains</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                
                <ChartTooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent 
                      active={active} 
                      payload={payload} 
                      formatter={(value) => `${value}%`}
                    />
                  )}
                />
                
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="var(--color-score)"
                  fill="var(--color-score)"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceRadarChart;
