
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Shield, AlertTriangle, Check, FileText, User } from 'lucide-react';

// Types for our charts
interface EventCountByType {
  name: string;
  value: number;
  color: string;
}

interface EventCountByStatus {
  name: string;
  success: number;
  warning: number;
  error: number;
}

interface AuditLogDashboardProps {
  logs: Array<{
    type: string;
    status: 'success' | 'warning' | 'error';
    timestamp: string;
  }>;
}

const AuditLogDashboard: React.FC<AuditLogDashboardProps> = ({ logs }) => {
  // Group logs by type
  const eventsByType = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1;
    return acc;
  }, {});
  
  // Format data for pie chart
  const typeData: EventCountByType[] = [
    { name: 'Access', value: eventsByType['access'] || 0, color: '#3b82f6' },
    { name: 'Disclosure', value: eventsByType['disclosure'] || 0, color: '#8b5cf6' },
    { name: 'Amendment', value: eventsByType['amendment'] || 0, color: '#10b981' },
    { name: 'Security', value: (eventsByType['login'] || 0) + (eventsByType['logout'] || 0) + (eventsByType['breach'] || 0), color: '#f97316' },
    { name: 'Admin', value: eventsByType['admin'] || 0, color: '#6b7280' },
  ];

  // Group logs by day for the last 7 days
  const today = new Date();
  const last7Days: Record<string, EventCountByStatus> = {};

  // Initialize the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    last7Days[dateStr] = { name: dateStr, success: 0, warning: 0, error: 0 };
  }

  // Fill in the data
  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Only count logs from the last 7 days
    if (last7Days[dateStr]) {
      last7Days[dateStr][log.status] += 1;
    }
  });

  // Convert to array for recharts
  const activityByDay = Object.values(last7Days);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Audit Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityByDay}
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ActivitySummaryCard 
          icon={<FileText className="h-5 w-5" />}
          title="Access Events"
          count={eventsByType['access'] || 0}
          color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
        />
        <ActivitySummaryCard 
          icon={<User className="h-5 w-5" />}
          title="Disclosure Events"
          count={eventsByType['disclosure'] || 0}
          color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
        />
        <ActivitySummaryCard 
          icon={<Shield className="h-5 w-5" />}
          title="Security Events"
          count={(eventsByType['login'] || 0) + (eventsByType['logout'] || 0) + (eventsByType['breach'] || 0)}
          color="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
        />
        <ActivitySummaryCard 
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Error Events"
          count={logs.filter(log => log.status === 'error').length}
          color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        />
      </div>
    </div>
  );
};

// Activity summary card component
interface ActivitySummaryCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: string;
}

const ActivitySummaryCard: React.FC<ActivitySummaryCardProps> = ({ icon, title, count, color }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{count}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLogDashboard;
