
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';

interface ComplianceDomain {
  subject: string;
  score: number;
  fullMark: number;
  previousScore?: number;
}

interface ComplianceRadarChartProps {
  data: ComplianceDomain[];
  className?: string;
}

const ComplianceRadarChart: React.FC<ComplianceRadarChartProps> = ({ data, className }) => {
  const [showPreviousScores, setShowPreviousScores] = useState(false);
  
  const chartConfig = {
    score: {
      label: "Current Score",
      theme: {
        light: "#2563eb",
        dark: "#3b82f6",
      },
    },
    previousScore: {
      label: "Previous Score",
      theme: {
        light: "#6B7280",
        dark: "#9CA3AF",
      },
    },
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Compliance Coverage</CardTitle>
          <CardDescription>HIPAA compliance across domains</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowPreviousScores(!showPreviousScores)}
        >
          {showPreviousScores ? "Hide Previous" : "Show Previous"}
        </Button>
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
                
                {showPreviousScores && (
                  <Radar
                    name="Previous Score"
                    dataKey="previousScore"
                    stroke="var(--color-previousScore)"
                    fill="var(--color-previousScore)"
                    fillOpacity={0.3}
                    strokeDasharray="5 5"
                  />
                )}
                
                <Radar
                  name="Current Score"
                  dataKey="score"
                  stroke="var(--color-score)"
                  fill="var(--color-score)"
                  fillOpacity={0.5}
                />
                
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceRadarChart;
