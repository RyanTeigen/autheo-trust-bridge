
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Shield, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AccessPatternChart from './monitoring/AccessPatternChart';
import SecurityAlertsList from './monitoring/SecurityAlertsList';
import ComplianceMetricCard from './monitoring/ComplianceMetricCard';
import { complianceMonitoring, SecurityEvent, AccessPattern } from '@/services/ComplianceMonitoringService';
import { SecurityAlert, AccessPattern as ComponentAccessPattern } from './monitoring/types';

interface RealTimeComplianceMonitorProps {
  className?: string;
}

const RealTimeComplianceMonitor: React.FC<RealTimeComplianceMonitorProps> = ({
  className = ''
}) => {
  const [overallScore, setOverallScore] = useState(94.5);
  const [privacyControls, setPrivacyControls] = useState(96.2);
  const [securityRules, setSecurityRules] = useState(92.1);
  const [activeAlerts, setActiveAlerts] = useState<SecurityAlert[]>([]);
  const [accessData, setAccessData] = useState<ComponentAccessPattern[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert service types to component types
  const convertSecurityEventToAlert = (event: SecurityEvent): SecurityAlert => ({
    id: event.id,
    severity: event.severity === 'high' ? 'critical' : event.severity === 'medium' ? 'warning' : 'info',
    message: event.title,
    timestamp: event.created_at,
    source: event.source,
    resolved: event.resolved
  });

  const convertAccessPatternToComponent = (pattern: AccessPattern): ComponentAccessPattern => {
    const hour = new Date(pattern.timestamp).getHours().toString().padStart(2, '0') + ':00';
    return {
      hour,
      count: 1, // We'll aggregate these in real implementation
      anomalyScore: pattern.risk_level === 'high' ? 1 : 0
    };
  };

  const loadData = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Load compliance metrics
      const metrics = await complianceMonitoring.getCurrentMetrics();
      setOverallScore(metrics.overallScore);
      setPrivacyControls(metrics.privacyControls);
      setSecurityRules(metrics.securityRules);

      // Load security alerts
      const alerts = await complianceMonitoring.getSecurityAlerts();
      setActiveAlerts(alerts.map(convertSecurityEventToAlert));

      // Load access patterns
      const patterns = await complianceMonitoring.getAccessPatterns();
      // Group patterns by hour and aggregate
      const hourlyPatterns = patterns.reduce((acc, pattern) => {
        const hour = new Date(pattern.timestamp).getHours().toString().padStart(2, '0') + ':00';
        if (!acc[hour]) {
          acc[hour] = { hour, count: 0, anomalyScore: 0 };
        }
        acc[hour].count += 1;
        if (pattern.risk_level === 'high') {
          acc[hour].anomalyScore = Math.max(acc[hour].anomalyScore, 1);
        }
        return acc;
      }, {} as Record<string, ComponentAccessPattern>);
      
      setAccessData(Object.values(hourlyPatterns));

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading compliance data:', err);
      setError('Failed to load compliance data. Using cached values.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter alerts by severity
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = activeAlerts.filter(alert => alert.severity === 'warning');
  const infoAlerts = activeAlerts.filter(alert => alert.severity === 'info');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      default: return 'ℹ️';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center">
            <Shield className="mr-2 h-5 w-5 text-autheo-primary" />
            Real-Time Compliance Monitor
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Live monitoring of HIPAA compliance metrics and security events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="outline">
            Updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Compliance Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComplianceMetricCard
            title="Overall Compliance"
            score={overallScore}
            icon={<Shield className="h-5 w-5" />}
            trend={overallScore >= 95 ? 'up' : overallScore >= 90 ? 'stable' : 'down'}
            description={`${overallScore >= 95 ? 'Excellent' : overallScore >= 90 ? 'Good' : 'Needs attention'}`}
          />
          <ComplianceMetricCard
            title="Privacy Controls"
            score={privacyControls}
            icon={<Lock className="h-5 w-5" />}
            trend={privacyControls >= 98 ? 'up' : privacyControls >= 95 ? 'stable' : 'down'}
            description={`${privacyControls >= 98 ? 'Excellent' : privacyControls >= 95 ? 'Good' : 'Needs attention'}`}
          />
          <ComplianceMetricCard
            title="Security Rules"
            score={securityRules}
            icon={<AlertTriangle className="h-5 w-5" />}
            trend={securityRules >= 95 ? 'up' : securityRules >= 90 ? 'stable' : 'down'}
            description={`${securityRules < 95 ? 'Items require attention' : 'Good compliance'}`}
          />
        </div>

        {/* Active Security Alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Active Security Alerts</h3>
            <div className="grid grid-cols-1 gap-2">
              {criticalAlerts.map(alert => (
                <Alert key={alert.id} className="border-red-200 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{getSeverityIcon(alert.severity)}</span>
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">{alert.source}</p>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </Alert>
              ))}
              {warningAlerts.map(alert => (
                <Alert key={alert.id} className="border-orange-200 bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{getSeverityIcon(alert.severity)}</span>
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">{alert.source}</p>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Monitoring Tabs */}
        <Tabs defaultValue="access-patterns" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="access-patterns">Access Patterns</TabsTrigger>
            <TabsTrigger value="security-alerts">Security Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="access-patterns" className="mt-4">
            <div className="p-4 border rounded-md">
              <h4 className="text-lg font-medium mb-4">Data Access Patterns (24hr)</h4>
              <AccessPatternChart data={accessData} />
            </div>
          </TabsContent>
          
          <TabsContent value="security-alerts" className="mt-4">
            <div className="p-4 border rounded-md">
              <h4 className="text-lg font-medium mb-4">Recent Security Events</h4>
              <SecurityAlertsList alerts={activeAlerts} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RealTimeComplianceMonitor;
