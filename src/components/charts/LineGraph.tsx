
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LineGraphData {
  label: string;
  value: number;
}

interface LineGraphProps {
  title: string;
  data: LineGraphData[];
  color?: string;
  unit?: string;
  height?: number;
}

const LineGraph: React.FC<LineGraphProps> = ({ 
  title, 
  data, 
  color = "#5EEBC4",
  unit = "",
  height = 200 
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-100 text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div style={{ width: '100%', height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis 
                dataKey="label" 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                stroke="#475569"
              />
              <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                stroke="#475569"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#f1f5f9'
                }}
                formatter={(value: number) => [`${value}${unit}`, title]}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                dot={{ r: 4, fill: color }}
                activeDot={{ r: 6, fill: color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineGraph;
