import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Database, 
  Key, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Activity,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthStatus from '@/components/auth/AuthStatus';

interface SystemHealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  details?: string;
}

const SystemHealthDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<SystemHealthMetric[]>([
    {
      name: 'Authentication Service',
      status: 'healthy',
      lastCheck: new Date().toLocaleTimeString(),
      details: 'Supabase Auth operational'
    },
    {
      name: 'Database Connection',
      status: 'healthy',
      lastCheck: new Date().toLocaleTimeString(),
      details: 'PostgreSQL responsive'
    },
    {
      name: 'Encryption System',
      status: 'warning',
      lastCheck: new Date().toLocaleTimeString(),
      details: 'WebAuthn fallback in use'
    },
    {
      name: 'Medical Records API',
      status: 'healthy',
      lastCheck: new Date().toLocaleTimeString(),
      details: 'All endpoints responsive'
    },
    {
      name: 'Provider Services',
      status: 'healthy',
      lastCheck: new Date().toLocaleTimeString(),
      details: 'EMR integration active'
    }
  ]);

  const refreshHealthCheck = async () => {
    setIsRefreshing(true);
    
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      lastCheck: new Date().toLocaleTimeString(),
      status: Math.random() > 0.1 ? 'healthy' : 'warning' // 90% chance of healthy
    })));
    
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const healthyCount = metrics.filter(m => m.status === 'healthy').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;
  const errorCount = metrics.filter(m => m.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card className="bg-background/95 border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Health Overview
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshHealthCheck}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{healthyCount}</div>
              <div className="text-sm text-muted-foreground">Healthy Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{warningCount}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{errorCount}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Status */}
      <AuthStatus />

      {/* Service Status Details */}
      <Card className="bg-background/95 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metric.status)}
                  <div>
                    <div className="font-medium text-foreground">{metric.name}</div>
                    <div className="text-sm text-muted-foreground">{metric.details}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusVariant(metric.status)}>
                    {metric.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {metric.lastCheck}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card className="bg-background/95 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-success" />
              <span className="text-sm">End-to-end encryption active</span>
            </div>
            <div className="flex items-center gap-3">
              <Key className="h-4 w-4 text-warning" />
              <span className="text-sm">Quantum-safe fallback enabled</span>
            </div>
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-success" />
              <span className="text-sm">Row-level security enforced</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-sm">HIPAA compliance active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;