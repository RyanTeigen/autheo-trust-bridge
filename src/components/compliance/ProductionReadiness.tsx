import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, Clock, Shield, Activity, Database, Users, Zap } from 'lucide-react';

interface ReadinessCategory {
  id: string;
  name: string;
  description: string;
  status: 'ready' | 'warning' | 'critical' | 'pending';
  score: number;
  checks: ReadinessCheck[];
}

interface ReadinessCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'warning' | 'fail' | 'pending';
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  last_checked: string;
  details?: string;
  remediation?: string;
}

const ProductionReadiness: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('security');

  const readinessChecks: ReadinessCheck[] = [
    // Security
    {
      id: 'encryption-at-rest',
      name: 'Data Encryption at Rest',
      description: 'All sensitive data is encrypted when stored',
      status: 'pass',
      severity: 'critical',
      category: 'security',
      last_checked: '2024-01-26T10:00:00Z',
      details: 'AES-256 encryption implemented for all PHI'
    },
    {
      id: 'encryption-in-transit',
      name: 'Data Encryption in Transit',
      description: 'All data transmissions are encrypted',
      status: 'pass',
      severity: 'critical',
      category: 'security',
      last_checked: '2024-01-26T10:00:00Z',
      details: 'TLS 1.3 enforced for all connections'
    },
    {
      id: 'access-controls',
      name: 'Role-Based Access Controls',
      description: 'Proper RBAC implementation with least privilege',
      status: 'pass',
      severity: 'critical',
      category: 'security',
      last_checked: '2024-01-26T10:00:00Z'
    },
    {
      id: 'audit-logging',
      name: 'Comprehensive Audit Logging',
      description: 'All PHI access and system actions are logged',
      status: 'pass',
      severity: 'critical',
      category: 'security',
      last_checked: '2024-01-26T10:00:00Z'
    },
    {
      id: 'vulnerability-scanning',
      name: 'Vulnerability Scanning',
      description: 'Regular security vulnerability assessments',
      status: 'warning',
      severity: 'high',
      category: 'security',
      last_checked: '2024-01-20T10:00:00Z',
      details: '3 medium-risk vulnerabilities identified',
      remediation: 'Schedule security patches for next maintenance window'
    },

    // Compliance
    {
      id: 'hipaa-compliance',
      name: 'HIPAA Compliance',
      description: 'Full HIPAA compliance verification',
      status: 'pass',
      severity: 'critical',
      category: 'compliance',
      last_checked: '2024-01-25T10:00:00Z'
    },
    {
      id: 'gdpr-compliance',
      name: 'GDPR Compliance',
      description: 'EU General Data Protection Regulation compliance',
      status: 'warning',
      severity: 'high',
      category: 'compliance',
      last_checked: '2024-01-24T10:00:00Z',
      details: 'Right to be forgotten implementation pending',
      remediation: 'Complete data deletion workflows'
    },
    {
      id: 'business-associate',
      name: 'Business Associate Agreements',
      description: 'All third-party vendors have signed BAAs',
      status: 'pass',
      severity: 'critical',
      category: 'compliance',
      last_checked: '2024-01-26T10:00:00Z'
    },

    // Infrastructure
    {
      id: 'high-availability',
      name: 'High Availability Setup',
      description: 'Redundant systems with failover capabilities',
      status: 'pass',
      severity: 'critical',
      category: 'infrastructure',
      last_checked: '2024-01-26T10:00:00Z',
      details: '99.9% uptime SLA with multi-region deployment'
    },
    {
      id: 'backup-recovery',
      name: 'Backup and Recovery',
      description: 'Automated backups with tested recovery procedures',
      status: 'pass',
      severity: 'critical',
      category: 'infrastructure',
      last_checked: '2024-01-26T10:00:00Z'
    },
    {
      id: 'monitoring-alerting',
      name: 'Monitoring and Alerting',
      description: 'Comprehensive system monitoring with alerts',
      status: 'pass',
      severity: 'critical',
      category: 'infrastructure',
      last_checked: '2024-01-26T10:00:00Z'
    },
    {
      id: 'load-testing',
      name: 'Load Testing',
      description: 'System performance under expected load',
      status: 'warning',
      severity: 'medium',
      category: 'infrastructure',
      last_checked: '2024-01-22T10:00:00Z',
      details: 'Response time degradation at 80% capacity',
      remediation: 'Optimize database queries and implement caching'
    },

    // Performance
    {
      id: 'response-times',
      name: 'API Response Times',
      description: 'All API endpoints meet performance requirements',
      status: 'pass',
      severity: 'high',
      category: 'performance',
      last_checked: '2024-01-26T10:00:00Z',
      details: 'Average response time: 120ms (target: <200ms)'
    },
    {
      id: 'database-performance',
      name: 'Database Performance',
      description: 'Database queries optimized for production load',
      status: 'warning',
      severity: 'medium',
      category: 'performance',
      last_checked: '2024-01-25T10:00:00Z',
      details: 'Some slow queries identified in audit logs',
      remediation: 'Add database indexes for frequently accessed data'
    },
    {
      id: 'cdn-setup',
      name: 'Content Delivery Network',
      description: 'CDN configured for static assets and caching',
      status: 'pass',
      severity: 'medium',
      category: 'performance',
      last_checked: '2024-01-26T10:00:00Z'
    }
  ];

  const categories: ReadinessCategory[] = [
    {
      id: 'security',
      name: 'Security',
      description: 'Data protection and access controls',
      status: 'warning',
      score: 90,
      checks: readinessChecks.filter(c => c.category === 'security')
    },
    {
      id: 'compliance',
      name: 'Compliance',
      description: 'Regulatory compliance verification',
      status: 'warning',
      score: 85,
      checks: readinessChecks.filter(c => c.category === 'compliance')
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      description: 'System reliability and scalability',
      status: 'warning',
      score: 88,
      checks: readinessChecks.filter(c => c.category === 'infrastructure')
    },
    {
      id: 'performance',
      name: 'Performance',
      description: 'System performance and optimization',
      status: 'warning',
      score: 82,
      checks: readinessChecks.filter(c => c.category === 'performance')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
      case 'pass':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'critical':
      case 'fail':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const overallScore = Math.round(categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length);
  const overallStatus = overallScore >= 95 ? 'ready' : overallScore >= 80 ? 'warning' : 'critical';

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              {getStatusIcon(overallStatus)}
              <h2 className="text-2xl font-bold">Production Readiness Score</h2>
            </div>
            <div className="text-4xl font-bold text-primary">{overallScore}%</div>
            <Badge className={getStatusColor(overallStatus)}>
              {overallStatus === 'ready' ? 'Production Ready' : 
               overallStatus === 'warning' ? 'Needs Attention' : 'Critical Issues'}
            </Badge>
            <p className="text-muted-foreground max-w-md mx-auto">
              {overallStatus === 'ready' ? 
                'System meets all production requirements' :
                'Some items require attention before production deployment'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const icon = category.id === 'security' ? Shield :
                      category.id === 'compliance' ? Users :
                      category.id === 'infrastructure' ? Database :
                      Activity;
          const IconComponent = icon;

          return (
            <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCategory(category.id)}>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <IconComponent className="h-8 w-8 mx-auto text-primary" />
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{category.score}%</div>
                    <Progress value={category.score} className="h-2" />
                    <Badge className={getStatusColor(category.status)}>
                      {getStatusIcon(category.status)}
                      <span className="ml-1 capitalize">{category.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Readiness Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <div className="space-y-4">
                  {category.checks.map((check) => (
                    <div key={check.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(check.status)}>
                              {getStatusIcon(check.status)}
                              <span className="ml-1 capitalize">{check.status}</span>
                            </Badge>
                            <Badge variant="outline" className={getSeverityColor(check.severity)}>
                              {check.severity}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{check.name}</h4>
                          <p className="text-sm text-muted-foreground">{check.description}</p>
                          {check.details && (
                            <p className="text-sm text-blue-600 mt-1">{check.details}</p>
                          )}
                          {check.remediation && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                              <strong>Remediation:</strong> {check.remediation}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          Last checked:<br />
                          {new Date(check.last_checked).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {(check.status === 'warning' || check.status === 'fail') && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            Re-run Check
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Production Deployment Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-start" disabled={overallStatus !== 'ready'}>
              <span className="font-medium">Deploy to Production</span>
              <span className="text-xs text-muted-foreground">
                {overallStatus === 'ready' ? 'Ready for deployment' : 'Fix critical issues first'}
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <span className="font-medium">Generate Report</span>
              <span className="text-xs text-muted-foreground">
                Export readiness assessment
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <span className="font-medium">Schedule Review</span>
              <span className="text-xs text-muted-foreground">
                Plan next readiness check
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionReadiness;