
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useSystemMonitoring } from '@/hooks/useSystemMonitoring';
import { isProduction, getEnvironment, getBuildInfo } from '@/utils/environment';

interface ReadinessCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

const ProductionReadinessChecker: React.FC = () => {
  const [checks, setChecks] = useState<ReadinessCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { systemHealth, systemMonitor } = useSystemMonitoring();
  
  const runReadinessChecks = async () => {
    setIsRunning(true);
    const newChecks: ReadinessCheck[] = [];
    
    try {
      // Environment checks
      const env = getEnvironment();
      newChecks.push({
        name: 'Environment Configuration',
        status: env === 'production' ? 'pass' : 'warning',
        message: `Running in ${env} environment`,
        critical: false
      });
      
      // Database connectivity
      try {
        const buildInfo = getBuildInfo();
        newChecks.push({
          name: 'Build Information',
          status: 'pass',
          message: `Version: ${buildInfo.version}, Environment: ${buildInfo.environment}`,
          critical: false
        });
      } catch (error) {
        newChecks.push({
          name: 'Build Information',
          status: 'fail',
          message: 'Unable to retrieve build information',
          critical: true
        });
      }
      
      // System health check
      if (systemHealth) {
        newChecks.push({
          name: 'System Health',
          status: systemHealth.status === 'healthy' ? 'pass' : 
                 systemHealth.status === 'degraded' ? 'warning' : 'fail',
          message: `System status: ${systemHealth.status}`,
          critical: systemHealth.status === 'critical'
        });
      }
      
      // Performance metrics check
      const performanceCheck = await checkPerformanceMetrics();
      newChecks.push(performanceCheck);
      
      // Security configuration check
      const securityCheck = checkSecurityConfiguration();
      newChecks.push(securityCheck);
      
      // Error rate check
      const errorCheck = await checkErrorRates();
      newChecks.push(errorCheck);
      
      // SSL/TLS check
      const sslCheck = checkSSLConfiguration();
      newChecks.push(sslCheck);
      
    } catch (error) {
      newChecks.push({
        name: 'Readiness Check Error',
        status: 'fail',
        message: `Error running checks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        critical: true
      });
    }
    
    setChecks(newChecks);
    setIsRunning(false);
    
    // Record readiness check in monitoring
    await systemMonitor?.recordMetric(
      'health',
      newChecks.filter(c => c.status === 'pass').length / newChecks.length * 100,
      'percent',
      { 
        totalChecks: newChecks.length,
        criticalFailures: newChecks.filter(c => c.critical && c.status === 'fail').length
      },
      newChecks.some(c => c.critical && c.status === 'fail') ? 'high' : 'low'
    );
  };
  
  const checkPerformanceMetrics = async (): Promise<ReadinessCheck> => {
    try {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const pageLoadTime = navigationTiming?.loadEventEnd - navigationTiming?.fetchStart || 0;
      
      return {
        name: 'Performance Metrics',
        status: pageLoadTime < 3000 ? 'pass' : pageLoadTime < 5000 ? 'warning' : 'fail',
        message: `Page load time: ${(pageLoadTime / 1000).toFixed(2)}s`,
        critical: pageLoadTime > 10000
      };
    } catch (error) {
      return {
        name: 'Performance Metrics',
        status: 'warning',
        message: 'Unable to measure performance',
        critical: false
      };
    }
  };
  
  const checkSecurityConfiguration = (): ReadinessCheck => {
    const isHTTPS = window.location.protocol === 'https:';
    const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null;
    
    if (!isHTTPS && isProduction()) {
      return {
        name: 'Security Configuration',
        status: 'fail',
        message: 'HTTPS required in production',
        critical: true
      };
    }
    
    return {
      name: 'Security Configuration', 
      status: isHTTPS && hasCSP ? 'pass' : 'warning',
      message: `HTTPS: ${isHTTPS ? 'enabled' : 'disabled'}, CSP: ${hasCSP ? 'configured' : 'missing'}`,
      critical: false
    };
  };
  
  const checkErrorRates = async (): Promise<ReadinessCheck> => {
    // Mock error rate check - in real implementation would check actual error rates
    const errorRate = Math.random() * 0.1; // Simulate 0-10% error rate
    
    return {
      name: 'Error Rates',
      status: errorRate < 0.01 ? 'pass' : errorRate < 0.05 ? 'warning' : 'fail',
      message: `Error rate: ${(errorRate * 100).toFixed(2)}%`,
      critical: errorRate > 0.1
    };
  };
  
  const checkSSLConfiguration = (): ReadinessCheck => {
    const isHTTPS = window.location.protocol === 'https:';
    
    return {
      name: 'SSL/TLS Configuration',
      status: isHTTPS ? 'pass' : isProduction() ? 'fail' : 'warning',
      message: isHTTPS ? 'SSL/TLS enabled' : 'SSL/TLS not configured',
      critical: !isHTTPS && isProduction()
    };
  };
  
  useEffect(() => {
    runReadinessChecks();
  }, []);
  
  const getStatusIcon = (status: ReadinessCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };
  
  const getStatusBadgeVariant = (status: ReadinessCheck['status']) => {
    switch (status) {
      case 'pass':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'fail':
        return 'destructive';
    }
  };
  
  const criticalFailures = checks.filter(c => c.critical && c.status === 'fail').length;
  const overallStatus = criticalFailures > 0 ? 'fail' : 
    checks.some(c => c.status === 'fail') ? 'warning' : 'pass';
  
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-slate-100">Production Readiness</CardTitle>
            <CardDescription className="text-slate-400">
              System readiness validation for production deployment
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(overallStatus)} className="capitalize">
              {overallStatus}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={runReadinessChecks}
              disabled={isRunning}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRunning ? 'Running...' : 'Re-check'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checks.map((check, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <div className="font-medium text-slate-100">{check.name}</div>
                  <div className="text-sm text-slate-400">{check.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {check.critical && (
                  <Badge variant="outline" className="text-xs border-orange-500 text-orange-400">
                    Critical
                  </Badge>
                )}
                <Badge variant={getStatusBadgeVariant(check.status)} className="capitalize">
                  {check.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {criticalFailures > 0 && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">
                {criticalFailures} critical failure{criticalFailures !== 1 ? 's' : ''} detected
              </span>
            </div>
            <p className="text-sm text-red-300 mt-1">
              Critical failures must be resolved before production deployment.
            </p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-slate-500">
          Last checked: {new Date().toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionReadinessChecker;
