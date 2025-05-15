
import React from 'react';
import { Activity, ClipboardCheck, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ComplianceProgressIndicator from '@/components/ui/ComplianceProgressIndicator';
import AuditLogItem from '@/components/ui/AuditLogItem';

const Index = () => {
  // Mock data for demo
  const complianceScore = 92;
  const recentAudits = [
    {
      id: '1',
      type: 'access' as const,
      timestamp: new Date().toISOString(),
      user: 'Dr. Sarah Johnson',
      action: 'Viewed patient record',
      resource: 'Patient #12345',
      status: 'success' as const,
    },
    {
      id: '2',
      type: 'disclosure' as const,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Patient Jane Smith',
      action: 'Shared lab results',
      resource: 'Lab Report #789',
      status: 'success' as const,
    },
    {
      id: '3',
      type: 'breach' as const,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: 'Unknown',
      action: 'Failed login attempt',
      resource: 'Admin Portal',
      status: 'error' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Autheo Trust & Compliance Auditor
        </p>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{complianceScore}%</div>
                <p className="text-xs text-muted-foreground">HIPAA Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patient Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-autheo-primary mr-3" />
              <div>
                <div className="text-2xl font-bold">1,284</div>
                <p className="text-xs text-muted-foreground">Total Patient Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ClipboardCheck className="h-8 w-8 text-autheo-secondary mr-3" />
              <div>
                <div className="text-2xl font-bold">5,394</div>
                <p className="text-xs text-muted-foreground">Events in last 24hrs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Open incidents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Progress */}
      <Card>
        <CardHeader>
          <CardTitle>HIPAA Compliance Status</CardTitle>
          <CardDescription>
            Real-time compliance status across all HIPAA requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <ComplianceProgressIndicator score={complianceScore} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Privacy Rule</span>
                  <span className="text-sm font-medium">100%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Security Rule</span>
                  <span className="text-sm font-medium">94%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Breach Notification</span>
                  <span className="text-sm font-medium">100%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Right of Access</span>
                  <span className="text-sm font-medium">100%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Minimum Necessary</span>
                  <span className="text-sm font-medium">83%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '83%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Accounting of Disclosures</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Last 24 hours of audit logs and compliance events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAudits.map((audit) => (
              <AuditLogItem key={audit.id} {...audit} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
