
import React from 'react';
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
import { AccessPattern } from './types';

interface AccessPatternChartProps {
  data: AccessPattern[];
}

const AccessPatternChart: React.FC<AccessPatternChartProps> = ({ data }) => {
  // Find anomalies
  const anomalies = data.filter(point => point.anomalyScore > 0);
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="hour" 
            tick={{ fontSize: 12 }}
            interval={3} // Show every 3rd hour for cleaner display
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number, name: string) => [
              value, 
              name === 'count' ? 'Access Events' : 'Anomaly Score'
            ]}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            name="Access Count"
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }} 
          />
          
          {/* Only show anomaly score line if there are anomalies */}
          {anomalies.length > 0 && (
            <Line 
              type="monotone" 
              dataKey="anomalyScore" 
              name="Anomaly Score"
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }} 
            />
          )}
          
          {/* Add reference lines for each anomaly */}
          {anomalies.map(anomaly => (
            <ReferenceLine 
              key={anomaly.hour} 
              x={anomaly.hour} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              label={{ 
                value: "Anomaly", 
                position: "top", 
                fill: "#ef4444",
                fontSize: 12
              }} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AccessPatternChart;
