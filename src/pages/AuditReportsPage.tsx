import React from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AuditReportsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Reports"
        description="View and generate comprehensive audit reports and compliance documentation"
        icon={<FileText className="h-8 w-8 text-primary" />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Pre-generated and custom audit reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">HIPAA Compliance Report</h4>
                    <Badge variant="default">Monthly</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive HIPAA compliance status and violations report for December 2024
                  </p>
                  <span className="text-xs text-muted-foreground">Generated: Dec 1, 2024</span>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">User Access Audit</h4>
                    <Badge variant="secondary">Weekly</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    User login activities, access patterns, and security events
                  </p>
                  <span className="text-xs text-muted-foreground">Generated: 2 days ago</span>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">Data Access Log</h4>
                    <Badge variant="outline">Daily</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Patient data access logs and record viewing activities
                  </p>
                  <span className="text-xs text-muted-foreground">Generated: Today</span>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">System Security Report</h4>
                    <Badge variant="default">Quarterly</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Security incidents, threat assessments, and system vulnerabilities
                  </p>
                  <span className="text-xs text-muted-foreground">Generated: Nov 30, 2024</span>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">Custom Report Builder</h4>
                    <Badge variant="default">On-Demand</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create custom audit reports with specific date ranges and criteria
                  </p>
                </div>
                <Button size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Create Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Filter and customize your reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Report Type</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Security Reports</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Compliance Reports</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Access Reports</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Custom Reports</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Time Period</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="period" defaultChecked className="rounded-full" />
                    <span className="text-sm">Last 30 days</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="period" className="rounded-full" />
                    <span className="text-sm">Last 90 days</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="period" className="rounded-full" />
                    <span className="text-sm">Custom Range</span>
                  </label>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
          <CardDescription>Current compliance metrics and status overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg text-center">
              <h3 className="text-2xl font-bold text-green-500">98.5%</h3>
              <p className="text-sm text-muted-foreground">HIPAA Compliance</p>
            </div>
            
            <div className="p-4 bg-blue-500/10 rounded-lg text-center">
              <h3 className="text-2xl font-bold text-blue-500">99.9%</h3>
              <p className="text-sm text-muted-foreground">System Uptime</p>
            </div>
            
            <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
              <h3 className="text-2xl font-bold text-yellow-500">2</h3>
              <p className="text-sm text-muted-foreground">Security Incidents</p>
            </div>
            
            <div className="p-4 bg-purple-500/10 rounded-lg text-center">
              <h3 className="text-2xl font-bold text-purple-500">1,247</h3>
              <p className="text-sm text-muted-foreground">Audit Entries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditReportsPage;