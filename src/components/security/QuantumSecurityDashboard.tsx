
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Lock, 
  Cpu, 
  Database,
  Network,
  Eye,
  Key,
  Zap
} from 'lucide-react';
import { useSystemMonitoring } from '@/hooks/useSystemMonitoring';
import PostQuantumVerification from './PostQuantumVerification';
import QuantumSecurityStatus from './QuantumSecurityStatus';

const QuantumSecurityDashboard = () => {
  const { systemHealth, loading } = useSystemMonitoring();
  const [activeThreats, setActiveThreats] = useState([
    {
      id: 1,
      type: 'quantum_attempt',
      severity: 'high',
      description: 'Potential quantum key extraction attempt detected',
      timestamp: '2024-01-27 14:32:15',
      mitigated: false
    },
    {
      id: 2,
      type: 'unusual_access',
      severity: 'medium',
      description: 'Unusual access pattern from IP 192.168.1.100',
      timestamp: '2024-01-27 13:45:22',
      mitigated: true
    }
  ]);

  const securityMetrics = {
    encryptionStatus: 98,
    quantumReadiness: 95,
    threatLevel: 'moderate',
    activeConnections: 1247,
    encryptedRecords: 15420,
    keyRotations: 12,
    lastQuantumCheck: '2024-01-27 12:00:00'
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'moderate': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantum Readiness</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.quantumReadiness}%</div>
            <Progress value={securityMetrics.quantumReadiness} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encryption Status</CardTitle>
            <Lock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.encryptionStatus}%</div>
            <Progress value={securityMetrics.encryptionStatus} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${getThreatLevelColor(securityMetrics.threatLevel)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${getThreatLevelColor(securityMetrics.threatLevel)}`}>
              {securityMetrics.threatLevel}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeThreats.filter(t => !t.mitigated).length} active threats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Records</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.encryptedRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Quantum-safe encrypted
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="threats" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="threats">Threat Monitor</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="quantum">Quantum Status</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Threats
              </CardTitle>
              <CardDescription>
                Real-time threat detection and mitigation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeThreats.map((threat) => (
                  <Alert key={threat.id} className={threat.severity === 'high' ? 'border-red-200' : ''}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex items-center justify-between">
                      <span>{threat.type.replace('_', ' ').toUpperCase()}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                        {threat.mitigated && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mitigated
                          </Badge>
                        )}
                      </div>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <p>{threat.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Detected: {threat.timestamp}
                      </p>
                      {!threat.mitigated && (
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setActiveThreats(prev => 
                              prev.map(t => t.id === threat.id ? {...t, mitigated: true} : t)
                            );
                          }}
                        >
                          Mitigate Threat
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Key Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Keys</span>
                    <Badge variant="outline">2,847</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rotations Today</span>
                    <Badge variant="outline">{securityMetrics.keyRotations}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Quantum-Safe Keys</span>
                    <Badge variant="outline" className="text-green-600">100%</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Force Key Rotation
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>ML-KEM Encryption</span>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Post-Quantum Signatures</span>
                    <Badge variant="outline" className="text-green-600">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Zero-Knowledge Proofs</span>
                    <Badge variant="outline" className="text-blue-600">Ready</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Audit Encryption
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Activity
              </CardTitle>
              <CardDescription>
                Real-time monitoring of system security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{securityMetrics.activeConnections}</div>
                    <p className="text-sm text-muted-foreground">Active Connections</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">847</div>
                    <p className="text-sm text-muted-foreground">Auth Events/Hour</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">99.97%</div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quantum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Quantum Threat Assessment
              </CardTitle>
              <CardDescription>
                Current quantum computing threat landscape and preparedness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Threat Indicators</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Current Quantum Risk</span>
                        <Badge variant="outline" className="text-yellow-600">Moderate</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Estimated Timeline</span>
                        <span className="text-sm text-muted-foreground">10-15 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Algorithm Vulnerability</span>
                        <Badge variant="outline" className="text-green-600">Protected</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Preparedness Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">NIST Standards</span>
                        <Badge variant="outline" className="text-green-600">Compliant</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Migration Progress</span>
                        <span className="text-sm text-muted-foreground">95% Complete</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Last Assessment</span>
                        <span className="text-sm text-muted-foreground">{securityMetrics.lastQuantumCheck}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Network className="h-4 w-4 mr-2" />
                  Run Quantum Vulnerability Scan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <QuantumSecurityStatus />
          <PostQuantumVerification />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuantumSecurityDashboard;
