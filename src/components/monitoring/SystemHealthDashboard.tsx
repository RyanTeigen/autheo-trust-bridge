
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Activity, Clock, Zap } from 'lucide-react';
import { useSystemMonitoring } from '@/hooks/useSystemMonitoring';

const SystemHealthDashboard: React.FC = () => {
  const { systemHealth, loading, error, fetchSystemHealth } = useSystemMonitoring();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autheo-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900 border-red-700">
        <CardHeader>
          <CardTitle className="text-red-100 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Monitoring Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-200">{error}</p>
          <Button 
            onClick={fetchSystemHealth} 
            variant="outline" 
            className="mt-4 border-red-500 text-red-100 hover:bg-red-800"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!systemHealth) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-900 border-green-700 text-green-100';
      case 'degraded':
        return 'bg-yellow-900 border-yellow-700 text-yellow-100';
      case 'critical':
        return 'bg-red-900 border-red-700 text-red-100';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-100';
    }
  };

  const getBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100">System Health Dashboard</h2>
        <Button onClick={fetchSystemHealth} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall System Status */}
      <Card className={getStatusColor(systemHealth.status)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(systemHealth.status)}
            System Status: {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
          </CardTitle>
          <CardDescription className="opacity-80">
            Real-time system health monitoring and performance metrics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-slate-100">
                {(systemHealth.metrics.errorRate * 100).toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Last 5 minutes</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-slate-100">
                {systemHealth.metrics.avgResponseTime.toFixed(0)}ms
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">API responses</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold text-slate-100">
                {systemHealth.metrics.activeAlerts}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Total unresolved</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-slate-100">
                {systemHealth.metrics.criticalAlerts}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Messages */}
      {systemHealth.status !== 'healthy' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">System Status Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemHealth.metrics.criticalAlerts > 0 && (
                <Badge variant="destructive">
                  {systemHealth.metrics.criticalAlerts} Critical Alert(s) Active
                </Badge>
              )}
              {systemHealth.metrics.errorRate > 0.05 && (
                <Badge variant="destructive">
                  High Error Rate Detected
                </Badge>
              )}
              {systemHealth.metrics.avgResponseTime > 2000 && (
                <Badge variant="secondary">
                  Slow Response Times Detected
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemHealthDashboard;
