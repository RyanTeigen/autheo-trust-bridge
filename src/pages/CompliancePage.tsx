
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ComplianceOverviewTab from '@/components/compliance/tabs/ComplianceOverviewTab';
import ComplianceMonitoringTab from '@/components/compliance/tabs/ComplianceMonitoringTab';
import ComplianceAuditTab from '@/components/compliance/tabs/ComplianceAuditTab';
import ComplianceToolsTab from '@/components/compliance/tabs/ComplianceToolsTab';
import ComplianceReportsTab from '@/components/compliance/tabs/ComplianceReportsTab';
import PolicyAcknowledgmentAdmin from '@/components/compliance/PolicyAcknowledgmentAdmin';
import HIPAAComplianceOverview from '@/components/compliance/HIPAAComplianceOverview';

const CompliancePage = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  
  // Check if user has compliance role
  const hasComplianceRole = profile?.role === 'compliance' || profile?.role === 'admin';
  
  const runAudit = () => {
    toast({
      title: "Audit In Progress",
      description: "Running comprehensive compliance audit. This may take a few minutes.",
    });
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">HIPAA Compliance Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor, manage, and maintain your organization's compliance status
              </p>
            </div>
          </div>

          {!hasComplianceRole && (
            <Alert className="mb-4 bg-destructive/10 border-destructive/30 text-destructive-foreground">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>
                You are accessing this page with creator privileges. Normally, this page is restricted to users with compliance or admin roles.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Tabbed Interface */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-card border-border">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Monitoring
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Audit
            </TabsTrigger>
            <TabsTrigger 
              value="policy-acks" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Policy Acks
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Tools
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              <HIPAAComplianceOverview />
              <ComplianceOverviewTab onRunAudit={runAudit} />
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <ComplianceMonitoringTab />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <ComplianceAuditTab />
          </TabsContent>

          <TabsContent value="policy-acks" className="mt-6">
            <PolicyAcknowledgmentAdmin />
          </TabsContent>

          <TabsContent value="tools" className="mt-6">
            <ComplianceToolsTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ComplianceReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompliancePage;
