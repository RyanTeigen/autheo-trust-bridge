/**
 * Security Dashboard Component
 * Displays comprehensive security status, metrics, and alerts
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Key, 
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { securityManager } from '@/services/security/EnhancedSecurityManager';
import { useSecureStorage } from '@/hooks/useSecureStorage';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  recentEvents: number;
  riskScore: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    recentEvents: 0,
    riskScore: 0
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const { 
    isReady: storageReady, 
    checkKeyRotation, 
    rotateEncryptionKey,
    encryptionKeyReady 
  } = useSecureStorage({ enableMonitoring: true });
  
  const { toast } = useToast();

  // Load security data
  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      const [securityMetrics, securityAlerts] = await Promise.all([
        securityManager.getSecurityMetrics(),
        Promise.resolve(securityManager.getSecurityAlerts())
      ]);
      
      setMetrics(securityMetrics);
      setAlerts(securityAlerts);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load security data:', error);
      toast({
        title: 'Security Dashboard Error',
        description: 'Failed to load security metrics. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if key rotation is needed
  const handleKeyRotationCheck = async () => {
    try {
      const needsRotation = await checkKeyRotation();
      if (needsRotation) {
        toast({
          title: 'Key Rotation Recommended',
          description: 'Your encryption keys should be rotated for security.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Key rotation check failed:', error);
    }
  };

  // Handle manual key rotation
  const handleKeyRotation = async () => {
    try {
      await rotateEncryptionKey();
      toast({
        title: 'Keys Rotated',
        description: 'Encryption keys have been successfully rotated.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Key rotation failed:', error);
      toast({
        title: 'Key Rotation Failed',
        description: 'Failed to rotate encryption keys. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Acknowledge security alert
  const acknowledgeAlert = (alertId: string) => {
    securityManager.acknowledgeAlert(alertId);
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    toast({
      title: 'Alert Acknowledged',
      description: 'Security alert has been acknowledged.',
      variant: 'default'
    });
  };

  // Get security status
  const getSecurityStatus = () => {
    if (metrics.criticalEvents > 5) return 'critical';
    if (metrics.riskScore > 60) return 'high';
    if (metrics.riskScore > 30) return 'medium';
    return 'secure';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <ShieldAlert className="h-5 w-5 text-red-500" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium': return <Shield className="h-5 w-5 text-yellow-500" />;
      default: return <ShieldCheck className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  // Load data on mount and set up refresh interval
  useEffect(() => {
    loadSecurityData();
    handleKeyRotationCheck();
    
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const securityStatus = getSecurityStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your security posture and threats
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusColor(securityStatus) as any} className="flex items-center gap-1">
            {getStatusIcon(securityStatus)}
            {securityStatus.toUpperCase()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSecurityData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {alerts.length} active security alert{alerts.length !== 1 ? 's' : ''} requiring attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Security Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.riskScore}</div>
                <Progress value={metrics.riskScore} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower is better
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Past 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.recentEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Past 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Security Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(securityStatus)}
                Security Status
              </CardTitle>
              <CardDescription>
                Overall security posture and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Encryption Status</span>
                  {encryptionKeyReady ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Secure Storage</span>
                  {storageReady ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Initializing
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Security Monitoring</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-lg font-semibold">No Active Alerts</h3>
                  <p className="text-muted-foreground">
                    All security alerts have been addressed.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Alert key={alert.id} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <strong>{alert.type}</strong>: {alert.message}
                      <br />
                      <small className="text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </small>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Encryption Management
              </CardTitle>
              <CardDescription>
                Manage your encryption keys and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Key Rotation</h4>
                  <p className="text-sm text-muted-foreground">
                    Regularly rotate encryption keys for enhanced security
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleKeyRotation}
                  disabled={!storageReady}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Rotate Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Security Monitoring
              </CardTitle>
              <CardDescription>
                Real-time security monitoring and threat detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <strong>Last Updated:</strong> {lastUpdated.toLocaleString()}
                </div>
                <div className="text-sm">
                  <strong>Monitoring Status:</strong> Active
                </div>
                <div className="text-sm">
                  <strong>Detection Rules:</strong> 12 active rules
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};