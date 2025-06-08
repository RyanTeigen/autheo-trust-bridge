import { useState, useEffect } from 'react';
import SystemMonitor, { SystemMetric, Alert } from '@/services/monitoring/SystemMonitor';
import PerformanceMonitor from '@/services/monitoring/PerformanceMonitor';

export const useSystemMonitoring = () => {
  const [systemHealth, setSystemHealth] = useState<{
    status: 'healthy' | 'degraded' | 'critical';
    metrics: {
      errorRate: number;
      avgResponseTime: number;
      activeAlerts: number;
      criticalAlerts: number;
    };
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const systemMonitor = SystemMonitor.getInstance();
  const performanceMonitor = PerformanceMonitor.getInstance();

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const health = await systemMonitor.getSystemHealth();
      setSystemHealth(health);
    } catch (err) {
      console.error('Error fetching system health:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const recordMetric = async (
    metricType: SystemMetric['metricType'],
    value: number,
    unit: string,
    context?: Record<string, any>
  ) => {
    try {
      await systemMonitor.recordMetric(metricType, value, unit, context);
    } catch (err) {
      console.error('Error recording metric:', err);
    }
  };

  const createAlert = async (
    alertType: Alert['alertType'],
    severity: Alert['severity'],
    message: string,
    details?: Record<string, any>
  ) => {
    try {
      return await systemMonitor.createAlert(alertType, severity, message, details);
    } catch (err) {
      console.error('Error creating alert:', err);
      return null;
    }
  };

  const measureComponentRender = async (
    componentName: string,
    renderFunction: () => void | Promise<void>
  ) => {
    try {
      await performanceMonitor.measureComponentRender(componentName, renderFunction);
    } catch (err) {
      console.error('Error measuring component render:', err);
    }
  };

  const measureAPICall = async <T>(
    endpoint: string,
    method: string,
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    try {
      return await performanceMonitor.measureAPICall(endpoint, method, apiCall);
    } catch (err) {
      console.error('Error measuring API call:', err);
      return null;
    }
  };

  const recordUserActivity = async (
    userId: string,
    activity: string,
    details?: Record<string, any>
  ) => {
    try {
      await systemMonitor.recordUserActivity(userId, activity, details);
    } catch (err) {
      console.error('Error recording user activity:', err);
    }
  };

  const recordSecurityEvent = async (
    eventType: string,
    severity: Alert['severity'],
    details: Record<string, any>
  ) => {
    try {
      await systemMonitor.recordSecurityEvent(eventType, severity, details);
    } catch (err) {
      console.error('Error recording security event:', err);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await systemMonitor.resolveAlert(alertId);
      await fetchSystemHealth(); // Refresh health status
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    
    // Start performance monitoring
    performanceMonitor.startMonitoring();
    
    // Set up periodic health checks
    const interval = setInterval(fetchSystemHealth, 60000); // Every minute

    return () => {
      clearInterval(interval);
      performanceMonitor.stopMonitoring();
    };
  }, []);

  return {
    systemHealth,
    loading,
    error,
    systemMonitor,
    fetchSystemHealth,
    recordMetric,
    createAlert,
    measureComponentRender,
    measureAPICall,
    recordUserActivity,
    recordSecurityEvent,
    resolveAlert
  };
};
