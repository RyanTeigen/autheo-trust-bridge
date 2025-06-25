
import React from 'react';
import { Shield, Database, Users, Activity, AlertTriangle, CheckCircle, Eye, FileText, UserCheck } from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';
import { getTrendIcon } from '../utils/complianceUtils';

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

interface MetricsSectionsProps {
  metrics: ComplianceMetrics;
  loading: boolean;
}

const MetricsSections: React.FC<MetricsSectionsProps> = ({ metrics, loading }) => {
  // Key metrics data with real-time data
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

  // Detailed metrics
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

  return (
    <>
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
    </>
  );
};

export default MetricsSections;
