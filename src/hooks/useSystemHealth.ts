import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PerformanceMonitor from '@/services/monitoring/PerformanceMonitor';
import AlertManager from '@/services/monitoring/AlertManager';
import { MetricsCollector } from '@/services/monitoring/MetricsCollector';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'error';
  lastChecked: Date;
  database: {
    status: 'connected' | 'disconnected' | 'error';
    latency?: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    activeUsers: number;
  };
  alerts: {
    critical: number;
    warnings: number;
    total: number;
  };
  uptime: number;
}

export const useSystemHealth = () => {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    lastChecked: new Date(),
    database: { status: 'connected' },
    performance: { avgResponseTime: 0, errorRate: 0, activeUsers: 1 },
    alerts: { critical: 0, warnings: 0, total: 0 },
    uptime: 0,
  });

  // Check database connectivity
  const { data: dbHealth, isError: dbError } = useQuery({
    queryKey: ['database-health'],
    queryFn: async () => {
      const start = Date.now();
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        const latency = Date.now() - start;
        
        if (error) throw error;
        
        return {
          status: 'connected' as const,
          latency,
        };
      } catch (error) {
        throw error;
      }
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
  });

  // Monitor performance metrics
  useEffect(() => {
    const performanceMonitor = PerformanceMonitor.getInstance();
    const alertManager = AlertManager.getInstance();
    const metricsCollector = MetricsCollector.getInstance();

    const updateHealth = async () => {
      try {
        // Get performance data
        const performanceSummary = performanceMonitor.getMetricsSummary();
        const alerts = alertManager.getAlerts({ acknowledged: false });
        const recentMetrics = metricsCollector.getRecentMetrics('all', 300000); // Last 5 minutes

        // Calculate error rate
        const errorMetrics = recentMetrics.filter(m => m.severity === 'high' || m.severity === 'critical');
        const errorRate = recentMetrics.length > 0 ? (errorMetrics.length / recentMetrics.length) * 100 : 0;

        // Count alerts by severity
        const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
        const warningAlerts = alerts.filter(a => a.severity === 'medium' || a.severity === 'high').length;

        // Determine overall status
        let status: SystemHealth['status'] = 'healthy';
        if (dbError || criticalAlerts > 0 || errorRate > 10) {
          status = 'error';
        } else if (warningAlerts > 0 || errorRate > 5 || performanceSummary.averagePageLoad > 3000) {
          status = 'degraded';
        }

        // Calculate uptime (simplified - in production, store in persistent storage)
        const uptime = Date.now() - (window as any).__appStartTime || 0;

        const newHealth: SystemHealth = {
          status,
          lastChecked: new Date(),
          database: dbHealth || { status: dbError ? 'error' : 'disconnected' },
          performance: {
            avgResponseTime: performanceSummary.averagePageLoad,
            errorRate,
            activeUsers: 1, // In production, track real user sessions
          },
          alerts: {
            critical: criticalAlerts,
            warnings: warningAlerts,
            total: alerts.length,
          },
          uptime: Math.floor(uptime / 1000), // Convert to seconds
        };

        setHealth(newHealth);

        // Trigger alerts for degraded health
        if (status === 'error') {
          await alertManager.triggerAlert(
            'system_health',
            'critical',
            `System health is critical: DB=${newHealth.database.status}, Errors=${errorRate.toFixed(1)}%`,
            { health: newHealth }
          );
        } else if (status === 'degraded') {
          await alertManager.triggerAlert(
            'system_health',
            'medium',
            `System health is degraded: Performance=${performanceSummary.averagePageLoad.toFixed(0)}ms`,
            { health: newHealth }
          );
        }

      } catch (error) {
        console.error('Failed to update system health:', error);
        setHealth(prev => ({
          ...prev,
          status: 'error',
          lastChecked: new Date(),
        }));
      }
    };

    // Initial check
    updateHealth();

    // Set up regular health checks
    const interval = setInterval(updateHealth, 60000); // Every minute

    // Set app start time for uptime calculation
    if (!(window as any).__appStartTime) {
      (window as any).__appStartTime = Date.now();
    }

    return () => {
      clearInterval(interval);
    };
  }, [dbHealth, dbError]);

  // System health actions
  const actions = {
    refreshHealth: () => {
      setHealth(prev => ({ ...prev, lastChecked: new Date() }));
    },
    
    acknowledgeAlerts: () => {
      const alertManager = AlertManager.getInstance();
      const alerts = alertManager.getAlerts({ acknowledged: false });
      alerts.forEach(alert => alertManager.acknowledgeAlert(alert.id));
    },
    
    getDetailedMetrics: () => {
      const performanceMonitor = PerformanceMonitor.getInstance();
      const metricsCollector = MetricsCollector.getInstance();
      
      return {
        performance: performanceMonitor.getMetricsSummary(),
        metrics: metricsCollector.getRecentMetrics('all', 3600000), // Last hour
        webVitals: performanceMonitor.getWebVitals(),
      };
    },
    
    exportHealthReport: () => {
      const report = {
        health,
        timestamp: new Date().toISOString(),
        detailedMetrics: actions.getDetailedMetrics(),
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  };

  return {
    health,
    isLoading: !health.lastChecked,
    actions,
  };
};

export type { SystemHealth };