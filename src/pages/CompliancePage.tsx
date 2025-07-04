
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
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-100">HIPAA Compliance Dashboard</h1>
              <p className="text-slate-300">
                Monitor, manage, and maintain your organization's compliance status
              </p>
            </div>
          </div>

          {!hasComplianceRole && (
            <Alert className="mb-4 bg-amber-900/20 border-amber-500/30 text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>
                You are accessing this page with creator privileges. Normally, this page is restricted to users with compliance or admin roles.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Tabbed Interface */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
            >
              Monitoring
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
            >
              Audit
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
            >
              Tools
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ComplianceOverviewTab onRunAudit={runAudit} />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <ComplianceMonitoringTab />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <ComplianceAuditTab />
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
