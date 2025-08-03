import React from 'react';
import { Settings } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SystemSettingsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure system-wide settings and preferences"
        icon={<Settings className="h-8 w-8 text-primary" />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage system security configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Enhanced security for user accounts</p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Session Timeout</h4>
                  <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                </div>
                <Badge variant="secondary">30 minutes</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Password Complexity</h4>
                  <p className="text-sm text-muted-foreground">Minimum password requirements</p>
                </div>
                <Badge variant="default">High</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Audit Logging</h4>
                  <p className="text-sm text-muted-foreground">System activity monitoring</p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>General system settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Maintenance Mode</h4>
                  <p className="text-sm text-muted-foreground">System maintenance status</p>
                </div>
                <Badge variant="outline">Disabled</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Data Backup</h4>
                  <p className="text-sm text-muted-foreground">Automated backup schedule</p>
                </div>
                <Badge variant="default">Daily</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">API Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground">Request throttling</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Health Check</h4>
                  <p className="text-sm text-muted-foreground">System health monitoring</p>
                </div>
                <Badge variant="default">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>External system integrations and API configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">EHR Integration</h4>
                <Badge variant="default">Connected</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Electronic Health Records system integration for seamless data exchange.
              </p>
            </div>
            
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Laboratory System</h4>
                <Badge variant="default">Connected</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Direct connection to laboratory systems for real-time results.
              </p>
            </div>
            
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Pharmacy Network</h4>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Integration with pharmacy networks for prescription management.
              </p>
            </div>
            
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Insurance Verification</h4>
                <Badge variant="default">Connected</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time insurance verification and eligibility checks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettingsPage;