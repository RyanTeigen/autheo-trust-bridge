
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Minus, Users, Database, Activity, FileText, Eye, UserCheck } from 'lucide-react';
import ComplianceProgressIndicator from '@/components/ui/ComplianceProgressIndicator';
import { MetricCard } from '@/components/ui/metric-card';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';

interface ComplianceOverviewTabProps {
  onRunAudit: () => void;
}

interface ComplianceMetrics {
  totalAuditLogs: number;
  errorRate: number;
  activeUsers: number;
  recentErrors: number;
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  uniquePatients: number;
  uniqueProviders: number;
  recentAccessCount: number;
  recordSharesCount: number;
  soapNotesCount: number;
  medicalRecordsCount: number;
  accessDeniedCount: number;
  successfulLogins: number;
}

const ComplianceOverviewTab: React.FC<ComplianceOverviewTabProps> = ({ onRunAudit }) => {
  const [overallScore, setOverallScore] = useState(92);
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalAuditLogs: 0,
    errorRate: 0,
    activeUsers: 0,
    recentErrors: 0,
    complianceScore: 92,
    riskLevel: 'low',
    uniquePatients: 0,
    uniqueProviders: 0,
    recentAccessCount: 0,
    recordSharesCount: 0,
    soapNotesCount: 0,
    medicalRecordsCount: 0,
    accessDeniedCount: 0,
    successfulLogins: 0
  });
  const [loading, setLoading] = useState(true);
  const { logAccess } = useAuditLog();

  useEffect(() => {
    fetchComplianceMetrics();
    logAccess('compliance_overview', undefined, 'Accessed compliance overview dashboard');
  }, []);

  const fetchComplianceMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch total audit logs
      const { count: totalLogs } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });

      // Fetch recent errors (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: errorCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'error')
        .gte('timestamp', yesterday.toISOString());

      // Fetch active users (users with recent activity)
      const { count: activeUserCount } = await supabase
        .from('audit_logs')
        .select('user_id', { count: 'exact', head: true })
        .gte('timestamp', yesterday.toISOString())
        .not('user_id', 'is', null);

      // Fetch unique patients count
      const { count: uniquePatientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Fetch unique providers count  
      const { count: uniqueProvidersCount } = await supabase
        .from('providers')
        .select('*', { count: 'exact', head: true });

      // Fetch recent access count (last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { count: recentAccessCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'ACCESS')
        .gte('timestamp', lastWeek.toISOString());

      // Fetch record shares count
      const { count: recordSharesCount } = await supabase
        .from('record_shares')
        .select('*', { count: 'exact', head: true });

      // Fetch SOAP notes count
      const { count: soapNotesCount } = await supabase
        .from('soap_notes')
        .select('*', { count: 'exact', head: true });

      // Fetch medical records count
      const { count: medicalRecordsCount } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true });

      // Fetch access denied count (last 30 days)
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);
      
      const { count: accessDeniedCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .ilike('details', '%denied%')
        .gte('timestamp', lastMonth.toISOString());

      // Fetch successful logins (last 7 days)
      const { count: successfulLogins } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'LOGIN')
        .eq('status', 'success')
        .gte('timestamp', lastWeek.toISOString());

      // Calculate error rate
      const errorRate = totalLogs && totalLogs > 0 ? ((errorCount || 0) / totalLogs) * 100 : 0;
      
      // Determine risk level based on error rate and access denied count
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (errorRate > 10 || (accessDeniedCount || 0) > 50) riskLevel = 'high';
      else if (errorRate > 5 || (accessDeniedCount || 0) > 20) riskLevel = 'medium';

      // Calculate compliance score based on metrics
      let complianceScore = 100;
      if (errorRate > 0) complianceScore -= Math.min(errorRate * 2, 20);
      if ((errorCount || 0) > 10) complianceScore -= 10;
      if ((accessDeniedCount || 0) > 20) complianceScore -= 15;
      
      setMetrics({
        totalAuditLogs: totalLogs || 0,
        errorRate: Math.round(errorRate * 100) / 100,
        activeUsers: activeUserCount || 0,
        recentErrors: errorCount || 0,
        complianceScore: Math.max(Math.round(complianceScore), 0),
        riskLevel,
        uniquePatients: uniquePatientsCount || 0,
        uniqueProviders: uniqueProvidersCount || 0,
        recentAccessCount: recentAccessCount || 0,
        recordSharesCount: recordSharesCount || 0,
        soapNotesCount: soapNotesCount || 0,
        medicalRecordsCount: medicalRecordsCount || 0,
        accessDeniedCount: accessDeniedCount || 0,
        successfulLogins: successfulLogins || 0
      });
      
      setOverallScore(Math.max(Math.round(complianceScore), 0));
    } catch (error) {
      console.error('Error fetching compliance metrics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Enhanced key metrics data with real-time data
  const keyMetrics = [
    { 
      title: 'Privacy Rule', 
      value: '100%', 
      trend: 'up', 
      icon: <Shield className="h-4 w-4" />,
      description: 'PHI protection compliance'
    },
    { 
      title: 'Security Rule', 
      value: '94%', 
      trend: 'stable', 
      icon: <Shield className="h-4 w-4" />,
      description: 'Technical safeguards'
    },
    { 
      title: 'Audit Logs', 
      value: loading ? '...' : metrics.totalAuditLogs.toLocaleString(), 
      trend: 'up', 
      icon: <Database className="h-4 w-4" />,
      description: 'Total audit entries'
    },
    { 
      title: 'Active Users', 
      value: loading ? '...' : metrics.activeUsers.toString(), 
      trend: 'up', 
      icon: <Users className="h-4 w-4" />,
      description: 'Users with recent activity'
    },
  ];

  // New detailed metrics
  const detailedMetrics = [
    {
      title: 'Unique Patients',
      value: loading ? '...' : metrics.uniquePatients.toLocaleString(),
      trend: 'up',
      icon: <UserCheck className="h-4 w-4" />,
      description: 'Total registered patients'
    },
    {
      title: 'Unique Providers',
      value: loading ? '...' : metrics.uniqueProviders.toLocaleString(),
      trend: 'up',
      icon: <Users className="h-4 w-4" />,
      description: 'Total registered providers'
    },
    {
      title: 'Recent Access',
      value: loading ? '...' : metrics.recentAccessCount.toLocaleString(),
      trend: metrics.recentAccessCount > 100 ? 'up' : 'stable',
      icon: <Eye className="h-4 w-4" />,
      description: 'Access events (last 7 days)'
    },
    {
      title: 'Record Shares',
      value: loading ? '...' : metrics.recordSharesCount.toLocaleString(),
      trend: 'up',
      icon: <FileText className="h-4 w-4" />,
      description: 'Total shared records'
    },
    {
      title: 'SOAP Notes',
      value: loading ? '...' : metrics.soapNotesCount.toLocaleString(),
      trend: 'up',
      icon: <FileText className="h-4 w-4" />,
      description: 'Clinical documentation'
    },
    {
      title: 'Medical Records',
      value: loading ? '...' : metrics.medicalRecordsCount.toLocaleString(),
      trend: 'up',
      icon: <Database className="h-4 w-4" />,
      description: 'Total medical records'
    }
  ];

  // System health metrics
  const systemHealthMetrics = [
    {
      title: 'Error Rate',
      value: loading ? '...' : `${metrics.errorRate}%`,
      trend: metrics.errorRate < 2 ? 'up' : 'down',
      icon: <Activity className="h-4 w-4" />,
      description: 'System error percentage'
    },
    {
      title: 'Risk Level',
      value: loading ? '...' : metrics.riskLevel.toUpperCase(),
      trend: metrics.riskLevel === 'low' ? 'up' : 'down',
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'Current risk assessment'
    },
    {
      title: 'Access Denied',
      value: loading ? '...' : metrics.accessDeniedCount.toString(),
      trend: metrics.accessDeniedCount < 10 ? 'up' : 'down',
      icon: <Shield className="h-4 w-4" />,
      description: 'Blocked access attempts (30 days)'
    },
    {
      title: 'Successful Logins',
      value: loading ? '...' : metrics.successfulLogins.toString(),
      trend: 'up',
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Valid authentication (7 days)'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-slate-400" />;
    }
  };

  const criticalActions = [
    {
      title: 'Update Risk Assessment',
      description: 'Annual security risk assessment needs update',
      priority: 'high',
      dueDate: 'Due in 7 days'
    },
    {
      title: 'Security Training',
      description: '12 staff members need to complete training',
      priority: 'medium',
      dueDate: 'Due in 2 weeks'
    },
    {
      title: 'Review Recent Errors',
      description: `${metrics.recentErrors} errors logged in the last 24 hours`,
      priority: metrics.recentErrors > 5 ? 'high' : 'low',
      dueDate: 'Immediate attention needed'
    },
    {
      title: 'Review Access Denials',
      description: `${metrics.accessDeniedCount} access attempts denied in the last 30 days`,
      priority: metrics.accessDeniedCount > 20 ? 'high' : 'medium',
      dueDate: 'Review security logs'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Compliance Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-autheo-primary flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Overall Compliance Score
              </CardTitle>
              <Badge 
                variant="outline" 
                className={`${overallScore >= 90 ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-amber-600/20 text-amber-400 border-amber-500/30'}`}
              >
                {overallScore}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ComplianceProgressIndicator score={overallScore} />
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">
                  Last assessment: {new Date().toLocaleDateString()}
                  {loading && <span className="ml-2 text-autheo-primary">Updating...</span>}
                </span>
                <Button 
                  onClick={() => {
                    onRunAudit();
                    fetchComplianceMetrics();
                  }} 
                  size="sm" 
                  className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
                >
                  Run New Audit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-autheo-primary">Quick Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Active Alerts</span>
              <Badge variant="destructive">
                {loading ? '...' : metrics.recentErrors}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Risk Level</span>
              <Badge 
                variant="outline" 
                className={`${metrics.riskLevel === 'low' ? 'bg-green-100 text-green-800' : metrics.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}
              >
                {loading ? '...' : metrics.riskLevel}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Next Audit</span>
              <span className="text-sm text-slate-400">Q3 2025</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={getTrendIcon(metric.trend)}
            description={metric.description}
          />
        ))}
      </div>

      {/* Detailed Metrics Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Detailed Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {detailedMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              trend={getTrendIcon(metric.trend)}
              description={metric.description}
            />
          ))}
        </div>
      </div>

      {/* System Health Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemHealthMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              trend={getTrendIcon(metric.trend)}
              description={metric.description}
            />
          ))}
        </div>
      </div>

      {/* Critical Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-autheo-primary flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Priority Actions Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalActions.map((action, index) => (
              <div key={index} className="flex items-start justify-between p-4 border border-slate-600 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-slate-100">{action.title}</h4>
                    <Badge 
                      variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'secondary' : 'outline'}
                      className={action.priority === 'medium' ? 'bg-amber-100 text-amber-800' : ''}
                    >
                      {action.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{action.description}</p>
                  <p className="text-xs text-slate-500">{action.dueDate}</p>
                </div>
                <Button size="sm" className="ml-4 bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900">
                  Take Action
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Alert */}
      <Alert className={`${overallScore >= 90 ? 'bg-green-900/20 border-green-500/30' : 'bg-amber-900/20 border-amber-500/30'}`}>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className={`${overallScore >= 90 ? 'text-green-200' : 'text-amber-200'}`}>
          {overallScore >= 90 
            ? 'Your organization maintains a strong compliance posture. Continue monitoring critical areas for improvement.'
            : 'Your compliance score needs attention. Review the priority actions and address critical issues.'
          }
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ComplianceOverviewTab;
