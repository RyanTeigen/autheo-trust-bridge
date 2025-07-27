import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface RealTimeVitalChartProps {
  title: string;
  description: string;
  data: any[];
  lines: {
    dataKey: string;
    stroke: string;
    name: string;
    yAxisId?: string;
  }[];
  referenceLines?: {
    y: number;
    stroke: string;
    yAxisId?: string;
  }[];
  leftDomain?: [number, number];
  rightDomain?: [number, number];
}

const RealTimeVitalChart: React.FC<RealTimeVitalChartProps> = ({
  title,
  description,
  data,
  lines,
  referenceLines = [],
  leftDomain,
  rightDomain
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            {leftDomain && <YAxis yAxisId="left" domain={leftDomain} />}
            {rightDomain && <YAxis yAxisId="right" orientation="right" domain={rightDomain} />}
            <Tooltip />
            {lines.map((line, index) => (
              <Line 
                key={index}
                yAxisId={line.yAxisId || "left"}
                type="monotone" 
                dataKey={line.dataKey} 
                stroke={line.stroke} 
                strokeWidth={2}
                name={line.name}
              />
            ))}
            {referenceLines.map((refLine, index) => (
              <ReferenceLine 
                key={index}
                yAxisId={refLine.yAxisId || "left"} 
                y={refLine.y} 
                stroke={refLine.stroke} 
                strokeDasharray="5 5" 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RealTimeVitalChart;