
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

export interface EventCountByStatus {
  name: string;
  success: number;
  warning: number;
  error: number;
}

interface ActivityBarChartProps {
  data: EventCountByStatus[];
}

const ActivityBarChart: React.FC<ActivityBarChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Activity (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="success" stackId="a" fill="#10b981" name="Success" />
              <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Warning" />
              <Bar dataKey="error" stackId="a" fill="#ef4444" name="Error" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityBarChart;
