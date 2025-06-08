import { supabase } from '@/integrations/supabase/client';
import { 
  validateDataIntegrity, 
  sanitizeString 
} from '@/utils/validation';
import { 
  asyncHandler, 
  handleSupabaseError, 
  ValidationError,
  logError 
} from '@/utils/errorHandling';
import { requireAuthentication } from '@/utils/security';
import LoadingStates from '@/components/ux/LoadingStates';
import { SystemMetric, Alert, UXEvent, HealthcareEvent, SystemHealth } from './MonitoringTypes';
import { MetricsCollector } from './MetricsCollector';
import { AlertManager } from './AlertManager';

export class SystemMonitor {
  private static instance: SystemMonitor;
  private metricsCollector: MetricsCollector;
  private alertManager: AlertManager;
  private uxEvents: UXEvent[] = [];
  private healthcareEvents: HealthcareEvent[] = [];

  public static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  private constructor() {
    this.metricsCollector = MetricsCollector.getInstance();
    this.alertManager = AlertManager.getInstance();
    this.startPeriodicMonitoring();
  }

  // Record system metrics (delegated to MetricsCollector)
  recordMetric = asyncHandler(async (
    metricType: SystemMetric['metricType'],
    value: number,
    unit: string,
    context?: Record<string, any>,
    severity: SystemMetric['severity'] = 'low'
  ): Promise<void> => {
    await this.metricsCollector.recordMetric(metricType, value, unit, context, severity);
  });

  // Create system alerts (delegated to AlertManager)
  createAlert = asyncHandler(async (
    alertType: Alert['alertType'],
    severity: Alert['severity'],
    message: string,
    details?: Record<string, any>
  ): Promise<string> => {
    return await this.alertManager.createAlert(alertType, severity, message, details);
  });

  // Monitor API response times
  recordAPIResponse = asyncHandler(async (
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    userId?: string
  ): Promise<void> => {
    const severity = responseTime > 2000 ? 'medium' : 'low';
    
    await this.recordMetric(
      'performance',
      responseTime,
      'ms',
      {
        endpoint: sanitizeString(endpoint),
        method: sanitizeString(method),
        statusCode,
        userId
      },
      severity
    );
  });

  // Monitor error rates
  recordError = asyncHandler(async (
    errorType: string,
    errorMessage: string,
    context?: Record<string, any>
  ): Promise<void> => {
    await this.recordMetric(
      'error',
      1,
      'count',
      {
        errorType: sanitizeString(errorType),
        errorMessage: sanitizeString(errorMessage),
        ...context
      },
      'medium'
    );
  });

  // Monitor user activities
  recordUserActivity = asyncHandler(async (
    userId: string,
    activity: string,
    details?: Record<string, any>
  ): Promise<void> => {
    await this.recordMetric(
      'usage',
      1,
      'count',
      {
        userId: sanitizeString(userId),
        activity: sanitizeString(activity),
        ...details
      },
      'low'
    );
  });

  // Monitor security events
  recordSecurityEvent = asyncHandler(async (
    eventType: string,
    severity: Alert['severity'],
    details: Record<string, any>
  ): Promise<void> => {
    await this.recordMetric(
      'security',
      1,
      'count',
      {
        eventType: sanitizeString(eventType),
        ...details
      },
      severity
    );

    await this.createAlert(
      'security',
      severity,
      `Security event: ${eventType}`,
      details
    );
  });

  // Get system health status
  getSystemHealth = asyncHandler(async (): Promise<SystemHealth> => {
    const recentMetrics = this.metricsCollector.getRecentMetrics('all', 300000); // Last 5 minutes
    const recentErrors = recentMetrics.filter(m => m.metricType === 'error');
    const recentPerformance = recentMetrics.filter(m => m.metricType === 'performance');
    const activeAlerts = this.alertManager.getActiveAlerts();
    const criticalAlerts = this.alertManager.getCriticalAlerts();

    const errorRate = recentErrors.length / 300;
    const avgResponseTime = recentPerformance.length > 0
      ? recentPerformance.reduce((sum, m) => sum + m.value, 0) / recentPerformance.length
      : 0;

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (criticalAlerts.length > 0 || errorRate > 0.05) {
      status = 'critical';
    } else if (activeAlerts.length > 10 || avgResponseTime > 2000) {
      status = 'degraded';
    }

    return {
      status,
      metrics: {
        errorRate,
        avgResponseTime,
        activeAlerts: activeAlerts.length,
        criticalAlerts: criticalAlerts.length
      }
    };
  });

  // Resolve alerts (delegated to AlertManager)
  resolveAlert = asyncHandler(async (alertId: string): Promise<void> => {
    await this.alertManager.resolveAlert(alertId);
  });

  // Enhanced monitoring with UX feedback
  public recordUXEvent = async (
    eventType: 'interaction' | 'navigation' | 'error' | 'accessibility',
    eventData: Record<string, any>,
    severity: 'low' | 'medium' | 'high' = 'low'
  ): Promise<void> => {
    try {
      const uxEvent: UXEvent = {
        id: this.generateId(),
        type: 'ux_event',
        timestamp: new Date().toISOString(),
        event_type: eventType,
        data: eventData,
        severity,
        user_agent: navigator.userAgent,
        url: window.location.href
      };

      this.uxEvents.push(uxEvent);
      
      // Keep only last 1000 UX events in memory
      if (this.uxEvents.length > 1000) {
        this.uxEvents = this.uxEvents.slice(-1000);
      }
      
      console.log(`[UX Event] ${eventType}:`, eventData);

      // Trigger immediate flush for high severity events
      if (severity === 'high') {
        await this.flushUXEvents();
      }
    } catch (error) {
      console.error('Failed to record UX event:', error);
    }
  };

  // Healthcare-specific monitoring
  public recordHealthcareEvent = async (
    eventType: 'vital_recorded' | 'medication_taken' | 'alert_triggered' | 'appointment_scheduled',
    patientId: string,
    eventData: Record<string, any>,
    severity: 'low' | 'medium' | 'high' = 'low'
  ): Promise<void> => {
    try {
      const healthcareEvent: HealthcareEvent = {
        id: this.generateId(),
        type: 'healthcare_event',
        timestamp: new Date().toISOString(),
        event_type: eventType,
        patient_id: patientId,
        data: eventData,
        severity,
        compliance_relevant: ['medication_taken', 'vital_recorded'].includes(eventType)
      };

      this.healthcareEvents.push(healthcareEvent);
      
      // Keep only last 1000 healthcare events in memory
      if (this.healthcareEvents.length > 1000) {
        this.healthcareEvents = this.healthcareEvents.slice(-1000);
      }
      
      console.log(`[Healthcare Event] ${eventType}:`, eventData);

      // Immediate flush for critical healthcare events
      if (severity === 'high' || eventType === 'alert_triggered') {
        await this.flushHealthcareEvents();
      }
    } catch (error) {
      console.error('Failed to record healthcare event:', error);
    }
  };

  private startPeriodicMonitoring(): void {
    // Start periodic health checks
    setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 60000); // Every minute
  }

  private async performHealthCheck(): Promise<void> {
    // Perform basic system health checks
    const health = await this.getSystemHealth();
    
    await this.recordMetric(
      'health',
      health.status === 'healthy' ? 100 : health.status === 'degraded' ? 50 : 0,
      'percent',
      health.metrics,
      health.status === 'critical' ? 'critical' : 'low'
    );
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private async flushUXEvents(): Promise<void> {
    const events = this.uxEvents;
    this.uxEvents = [];
    
    // In a real implementation, this would persist UX events to database
    console.log('Flushing UX events:', events);
  }

  private async flushHealthcareEvents(): Promise<void> {
    const events = this.healthcareEvents;
    this.healthcareEvents = [];
    
    // In a real implementation, this would persist healthcare events to database
    console.log('Flushing healthcare events:', events);
  }
}

export default SystemMonitor;
export type { SystemMetric, Alert, UXEvent, HealthcareEvent } from './MonitoringTypes';
