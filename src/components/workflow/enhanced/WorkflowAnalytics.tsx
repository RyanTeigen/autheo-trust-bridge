import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Activity
} from 'lucide-react';

interface WorkflowAnalyticsProps {
  className?: string;
}

export const WorkflowAnalytics = ({ className }: WorkflowAnalyticsProps) => {
  // Mock analytics data
  const executionData = [
    { name: 'Mon', completed: 12, failed: 2, running: 3 },
    { name: 'Tue', completed: 15, failed: 1, running: 4 },
    { name: 'Wed', completed: 18, failed: 3, running: 2 },
    { name: 'Thu', completed: 20, failed: 1, running: 5 },
    { name: 'Fri', completed: 16, failed: 2, running: 3 },
    { name: 'Sat', completed: 8, failed: 0, running: 1 },
    { name: 'Sun', completed: 6, failed: 1, running: 0 },
  ];

  const nodeTypeData = [
    { name: 'Patient Intake', value: 35, color: '#3b82f6' },
    { name: 'Medical Record', value: 25, color: '#10b981' },
    { name: 'Appointment', value: 20, color: '#f59e0b' },
    { name: 'Consent', value: 15, color: '#ef4444' },
    { name: 'Compliance', value: 5, color: '#8b5cf6' },
  ];

  const performanceData = [
    { name: 'Week 1', avgTime: 45, efficiency: 85 },
    { name: 'Week 2', avgTime: 42, efficiency: 88 },
    { name: 'Week 3', avgTime: 38, efficiency: 92 },
    { name: 'Week 4', avgTime: 35, efficiency: 95 },
  ];

  const metrics = [
    {
      title: 'Total Executions',
      value: '1,247',
      change: '+12%',
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      change: '+2.1%',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Avg. Duration',
      value: '3.2 min',
      change: '-15%',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Active Users',
      value: '156',
      change: '+8%',
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">{metric.change}</span>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Execution Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={executionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" stackId="a" fill="#10b981" />
                <Bar dataKey="running" stackId="a" fill="#f59e0b" />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Node Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Node Type Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={nodeTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {nodeTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2">
                {nodeTypeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="avgTime" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Avg Time (min)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="efficiency" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Efficiency (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Patient Intake Flow</span>
                <Badge variant="secondary">Running</Badge>
              </div>
              <Progress value={75} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm">Compliance Check</span>
                <Badge variant="secondary">Running</Badge>
              </div>
              <Progress value={45} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm">SOAP Documentation</span>
                <Badge variant="secondary">Running</Badge>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium">Consent expiring soon</p>
                  <p className="text-muted-foreground">Patient ID: 1234</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium">Workflow completed</p>
                  <p className="text-muted-foreground">Patient Intake Flow</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium">Compliance violation</p>
                  <p className="text-muted-foreground">HIPAA audit failed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">System Load</span>
                <span className="text-sm text-green-600">Normal</span>
              </div>
              <Progress value={35} className="h-2" />
              
              <div className="flex justify-between">
                <span className="text-sm">Response Time</span>
                <span className="text-sm text-green-600">Good</span>
              </div>
              <Progress value={85} className="h-2" />
              
              <div className="flex justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="text-sm text-green-600">Low</span>
              </div>
              <Progress value={15} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};