import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Shield, Activity, TrendingUp, Clock, User, MapPin } from 'lucide-react';
import { securityMonitoring } from '@/services/security/SecurityMonitoringService';
import { format } from 'date-fns';

interface SecurityThreat {
  id: string;
  type: 'brute_force' | 'unusual_access' | 'data_breach' | 'session_hijack' | 'privilege_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, any>;
  detectedAt: string;
}

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  activeSessions: number;
  suspiciousActivity: number;
  lastThreatDetected?: string;
  complianceScore: number;
}

interface EnhancedSecurityMonitorProps {
  className?: string;
}

const severityConfig = {
  low: { color: 'bg-blue-500', label: 'Low' },
  medium: { color: 'bg-yellow-500', label: 'Medium' },
  high: { color: 'bg-orange-500', label: 'High' },
  critical: { color: 'bg-red-500', label: 'Critical' },
};

const threatTypeConfig = {
  brute_force: {
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    label: 'Brute Force Attack',
  },
  unusual_access: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    label: 'Unusual Access Pattern',
  },
  data_breach: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    label: 'Data Breach',
  },
  session_hijack: {
    icon: User,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    label: 'Session Hijacking',
  },
  privilege_escalation: {
    icon: TrendingUp,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    label: 'Privilege Escalation',
  },
};

export const EnhancedSecurityMonitor: React.FC<EnhancedSecurityMonitorProps> = ({ className }) => {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalLogins: 0,
    failedLogins: 0,
    activeSessions: 0,
    suspiciousActivity: 0,
    complianceScore: 85,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadSecurityData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      const storedThreats = securityMonitoring.getStoredThreats();
      const securityMetrics = await securityMonitoring.getSecurityMetrics();
      
      setThreats(storedThreats);
      setMetrics(securityMetrics);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateThreats = () => {
    securityMonitoring.simulateSecurityThreats();
    // Reload data after simulation
    setTimeout(loadSecurityData, 2000);
  };

  const resolveAllThreats = () => {
    localStorage.removeItem('security_threats');
    setThreats([]);
    setMetrics(prev => ({ ...prev, suspiciousActivity: 0 }));
  };

  const unresolvedThreats = threats.filter(threat => threat.severity !== 'low');
  const criticalThreats = threats.filter(threat => threat.severity === 'critical');

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Enhanced Security Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading security data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unresolvedThreats.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalThreats.length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Current user sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.failedLogins}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              Compliance rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Threat Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Security Threats</CardTitle>
              <CardDescription>
                Real-time security threat detection and monitoring
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={simulateThreats}>
                Simulate Threats
              </Button>
              {threats.length > 0 && (
                <Button variant="destructive" size="sm" onClick={resolveAllThreats}>
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {threats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Shield className="w-8 h-8 mb-2" />
              <div>No security threats detected</div>
              <div className="text-sm">Your system is secure</div>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {threats.map((threat) => {
                  const typeConfig = threatTypeConfig[threat.type];
                  const sevConfig = severityConfig[threat.severity];
                  const TypeIcon = typeConfig.icon;

                  return (
                    <div
                      key={threat.id}
                      className={`p-4 rounded-lg border ${typeConfig.bgColor}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${sevConfig.color}`} />
                          <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{typeConfig.label}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant={threat.severity === 'critical' ? 'destructive' : 'secondary'}>
                                {sevConfig.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(threat.detectedAt), 'MMM dd, HH:mm')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm">{threat.description}</div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {threat.userId && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                User: {threat.userId.slice(0, 8)}...
                              </div>
                            )}
                            {threat.ipAddress && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                IP: {threat.ipAddress}
                              </div>
                            )}
                          </div>

                          {Object.keys(threat.metadata).length > 0 && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                View Details
                              </summary>
                              <div className="mt-2 p-2 bg-background/50 rounded font-mono">
                                {JSON.stringify(threat.metadata, null, 2)}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};