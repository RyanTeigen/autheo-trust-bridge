
import React, { useState, useEffect } from 'react';
import { useComplianceMetrics } from '@/hooks/useComplianceMetrics';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, UserCheck, TrendingUp, Calendar } from 'lucide-react';
import ComplianceScoreCard from '@/components/compliance/overview/ComplianceScoreCard';
import QuickStatusCard from '@/components/compliance/overview/QuickStatusCard';
import MetricsSections from '@/components/compliance/overview/MetricsSections';
import PriorityActionsCard from '@/components/compliance/overview/PriorityActionsCard';
import StatusAlert from '@/components/compliance/overview/StatusAlert';
import AuditAnchorsWidget from '@/components/compliance/AuditAnchorsWidget';
import ConsentHashDisplay from '@/components/compliance/ConsentHashDisplay';

interface ComplianceOverviewTabProps {
  onRunAudit: () => void;
}

const ComplianceOverviewTab: React.FC<ComplianceOverviewTabProps> = ({ onRunAudit }) => {
  const { metrics, loading, refetchMetrics } = useComplianceMetrics();
  const [overallScore, setOverallScore] = useState(92);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalRecords: 0,
    accessRequestsThisMonth: 0,
    approvalRate: 0,
    activePatients: 0,
    activeProviders: 0,
    loading: true
  });

  // Update overall score when metrics change
  React.useEffect(() => {
    setOverallScore(metrics.complianceScore);
  }, [metrics.complianceScore]);

  useEffect(() => {
    fetchDashboardMetrics();
    
    // Set up real-time subscription for live updates
    const channel = supabase
      .channel('compliance-overview-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'medical_records'
      }, () => {
        fetchDashboardMetrics();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sharing_permissions'
      }, () => {
        fetchDashboardMetrics();
      })
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardMetrics, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      // Get total records
      const { count: totalRecords } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true });

      // Get access requests this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: accessRequests } = await supabase
        .from('sharing_permissions')
        .select('status')
        .gte('created_at', startOfMonth.toISOString());

      const accessRequestsThisMonth = accessRequests?.length || 0;
      const approvedRequests = accessRequests?.filter(req => req.status === 'approved').length || 0;
      const approvalRate = accessRequestsThisMonth > 0 ? (approvedRequests / accessRequestsThisMonth) * 100 : 0;

      // Get active patients and providers
      const { count: activePatients } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'patient');

      const { count: activeProviders } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'provider');

      setDashboardMetrics({
        totalRecords: totalRecords || 0,
        accessRequestsThisMonth,
        approvalRate: Math.round(approvalRate),
        activePatients: activePatients || 0,
        activeProviders: activeProviders || 0,
        loading: false
      });

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      setDashboardMetrics(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRunAudit = () => {
    onRunAudit();
    refetchMetrics();
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {dashboardMetrics.loading ? '...' : dashboardMetrics.totalRecords.toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Access Requests This Month</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {dashboardMetrics.loading ? '...' : dashboardMetrics.accessRequestsThisMonth}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {dashboardMetrics.loading ? '...' : `${dashboardMetrics.approvalRate}%`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {dashboardMetrics.loading ? '...' : 
                    `${dashboardMetrics.activePatients + dashboardMetrics.activeProviders}`
                  }
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {dashboardMetrics.activePatients}P + {dashboardMetrics.activeProviders}Pr
                </p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ComplianceScoreCard 
          score={overallScore}
          loading={loading}
          onRunAudit={handleRunAudit}
        />
        <QuickStatusCard 
          recentErrors={metrics.recentErrors}
          riskLevel={metrics.riskLevel}
          loading={loading}
        />
      </div>

      {/* Metrics Sections */}
      <MetricsSections metrics={metrics} loading={loading} />

      {/* Critical Actions and Blockchain Anchors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriorityActionsCard metrics={metrics} />
        <AuditAnchorsWidget />
      </div>

      {/* DID Consent Records */}
      <ConsentHashDisplay />

      {/* Status Alert */}
      <StatusAlert score={overallScore} />
    </div>
  );
};

export default ComplianceOverviewTab;
