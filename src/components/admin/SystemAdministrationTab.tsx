
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Server, 
  Database, 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SystemAdministrationTab: React.FC = () => {
  const { toast } = useToast();

  const systemServices = [
    { name: 'API Gateway', status: 'healthy', uptime: '99.9%', responseTime: '142ms' },
    { name: 'Database', status: 'healthy', uptime: '100%', responseTime: '23ms' },
    { name: 'Authentication Service', status: 'healthy', uptime: '99.8%', responseTime: '89ms' },
    { name: 'File Storage', status: 'warning', uptime: '98.5%', responseTime: '234ms' },
    { name: 'Encryption Service', status: 'healthy', uptime: '100%', responseTime: '45ms' },
  ];

  const systemMetrics = {
    cpuUsage: 67,
    memoryUsage: 72,
    diskUsage: 43,
    networkLoad: 28
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSystemAction = (action: string) => {
    toast({
      title: `${action} Initiated`,
      description: `System ${action.toLowerCase()} has been started. You will be notified when complete.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.cpuUsage}%</div>
            <Progress value={systemMetrics.cpuUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.memoryUsage}%</div>
            <Progress value={systemMetrics.memoryUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.diskUsage}%</div>
            <Progress value={systemMetrics.diskUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Load</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.networkLoad}%</div>
            <Progress value={systemMetrics.networkLoad} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* System Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Uptime: {service.uptime} | Response: {service.responseTime}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => handleSystemAction('Backup')}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Create System Backup
            </Button>
            
            <Button 
              onClick={() => handleSystemAction('Update')}
              className="w-full justify-start"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Updates
            </Button>
            
            <Button 
              onClick={() => handleSystemAction('Cleanup')}
              className="w-full justify-start"
              variant="outline"
            >
              <Database className="h-4 w-4 mr-2" />
              Database Cleanup
            </Button>
            
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                System maintenance actions may temporarily affect service availability.
                Schedule during low-usage periods when possible.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => handleSystemAction('Export')}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export System Data
            </Button>
            
            <Button 
              onClick={() => handleSystemAction('Import')}
              className="w-full justify-start"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            
            <Button 
              onClick={() => handleSystemAction('Archive')}
              className="w-full justify-start"
              variant="outline"
            >
              <Database className="h-4 w-4 mr-2" />
              Archive Old Records
            </Button>
            
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Data operations are logged and require administrative approval for
                sensitive operations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemAdministrationTab;
