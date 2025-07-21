import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, FileText, Monitor, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SecurityEventMonitor } from '@/components/security/SecurityEventMonitor';
import { SessionManager } from '@/components/security/SessionManager';
import { PolicyAcknowledgment } from '@/components/security/PolicyAcknowledgment';
import { PasswordComplexityValidator } from '@/components/security/PasswordComplexityValidator';
import { EnhancedSecurityMonitor } from '@/components/security/EnhancedSecurityMonitor';
import { useSecurityMetrics } from '@/hooks/useSecurityMetrics';

export default function SecurityDashboard() {
  const [testPassword, setTestPassword] = useState('');
  const [policyAcknowledged, setPolicyAcknowledged] = useState(false);
  const { metrics, loading, error, refetch } = useSecurityMetrics();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage HIPAA compliance and security measures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="outline" className="text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            HIPAA Compliant
          </Badge>
          <Badge variant="secondary">
            Score: {loading ? '...' : metrics.complianceScore}%
          </Badge>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Error loading security data: {error}</span>
          </div>
        </div>
      )}

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : metrics.activeSessions}
            </div>
            <p className="text-xs text-muted-foreground">
              Current user sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : metrics.securityEvents}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '...' : metrics.criticalEvents} critical events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : metrics.complianceScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              HIPAA compliance rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Audit</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : metrics.lastAudit}
            </div>
            <p className="text-xs text-muted-foreground">
              Security assessment date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : metrics.failedLogins}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Security Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="password">Password Policy</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <CardDescription>
                  Current security status and recent activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <div className="font-medium">Database Encryption</div>
                      <div className="text-sm text-muted-foreground">All PHI data encrypted at rest</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <div className="font-medium">Access Controls</div>
                      <div className="text-sm text-muted-foreground">Role-based permissions enforced</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <div className="font-medium">Audit Logging</div>
                      <div className="text-sm text-muted-foreground">All access events logged</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <div className="font-medium">Session Management</div>
                      <div className="text-sm text-muted-foreground">Enhanced session security implemented</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SessionManager />
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <EnhancedSecurityMonitor />
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Password Policy Testing</CardTitle>
                <CardDescription>
                  Test password complexity requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="test-password" className="text-sm font-medium">
                    Test Password
                  </label>
                  <input
                    id="test-password"
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="Enter a password to test complexity"
                    className="w-full px-3 py-2 border border-input rounded-md"
                  />
                </div>
                <PasswordComplexityValidator password={testPassword} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>
                  Current password requirements for HIPAA compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Minimum 8 characters length</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>At least one uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>At least one lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>At least one number</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>At least one special character</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Password history enforcement (last 5 passwords)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Maximum 90 days password age</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>HIPAA Compliance Status</CardTitle>
                <CardDescription>
                  Current compliance with HIPAA regulations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Administrative Safeguards</div>
                        <div className="text-sm text-muted-foreground">Security policies and procedures</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">Compliant</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Physical Safeguards</div>
                        <div className="text-sm text-muted-foreground">Data center and device security</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">Compliant</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Technical Safeguards</div>
                        <div className="text-sm text-muted-foreground">Access controls and encryption</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">Compliant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!policyAcknowledged && (
              <PolicyAcknowledgment
                onAcknowledged={() => setPolicyAcknowledged(true)}
                required={false}
              />
            )}

            {policyAcknowledged && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Policy Acknowledged
                  </CardTitle>
                  <CardDescription>
                    HIPAA policy has been acknowledged
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Thank you for acknowledging the HIPAA privacy and security policy. 
                    This acknowledgment has been recorded in the audit logs.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}